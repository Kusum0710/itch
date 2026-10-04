import React, { useState } from 'react';
import { useItch } from '../../context/ItchContext';
import { DISCOVERY_QUESTIONS } from '../../services/ai/discoveryQuestions';
import { analyzeDiscoveryTurn } from '../../services/apiClient';
import { Sparkles, ArrowRight, CornerDownLeft, RefreshCw, SlidersHorizontal, Check } from 'lucide-react';
import { MediaType } from '../../types';

export const DiscoveryModal: React.FC = () => {
  const {
    currentItch,
    updateItchProfile,
    addConversationTurn,
    setActiveView,
    refreshRecommendations,
    currentSession,
  } = useItch();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [naturalInput, setNaturalInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reflectionMessage, setReflectionMessage] = useState<string | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isConfident, setIsConfident] = useState(false);

  const currentQ = DISCOVERY_QUESTIONS[Math.min(questionIndex, DISCOVERY_QUESTIONS.length - 1)];

  // Option selection handler
  const handleSelectOption = async (option: typeof currentQ.options[0]) => {
    // 1. Update sliders
    updateItchProfile(option.sliderEffects);

    // 2. Record conversation turn
    addConversationTurn({
      id: 'turn_' + Date.now(),
      sender: 'user',
      message: `${option.label} — ${option.subtitle || ''}`,
      questionId: currentQ.id,
      selectedOptionId: option.id,
      inferredDelta: option.sliderEffects,
      timestamp: Date.now(),
    });

    const newCount = answeredCount + 1;
    setAnsweredCount(newCount);

    // 3. Empathetic micro-reflection
    setReflectionMessage(`Noted: ${option.label}. Dialing that into your profile.`);

    // 4. Decide if confident
    if (newCount >= 3) {
      setIsConfident(true);
    } else {
      setTimeout(() => {
        setQuestionIndex((prev) => Math.min(prev + 1, DISCOVERY_QUESTIONS.length - 1));
        setReflectionMessage(null);
      }, 400);
    }
  };

  // Free text natural language submission
  const handleNaturalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalInput.trim() || isAnalyzing) return;

    const userText = naturalInput.trim();
    setNaturalInput('');
    setIsAnalyzing(true);

    // Call API / heuristic analyzer
    const history = currentSession?.turns.map((t) => ({ sender: t.sender, message: t.message })) || [];
    const analysis = await analyzeDiscoveryTurn(userText, currentItch, history);

    setIsAnalyzing(false);

    // Update profile
    if (analysis.slider_adjustments) {
      updateItchProfile(analysis.slider_adjustments);
    }

    addConversationTurn({
      id: 'turn_' + Date.now(),
      sender: 'user',
      message: userText,
      inferredDelta: analysis.slider_adjustments,
      timestamp: Date.now(),
    });

    setReflectionMessage(analysis.empathetic_reflection);

    const newCount = answeredCount + 1;
    setAnsweredCount(newCount);

    if (analysis.ready_for_recommendation || newCount >= 3) {
      setIsConfident(true);
    } else {
      setTimeout(() => {
        setQuestionIndex((prev) => Math.min(prev + 1, DISCOVERY_QUESTIONS.length - 1));
      }, 900);
    }
  };

  const handleFinishDiscovery = () => {
    refreshRecommendations();
    setActiveView('recommendations');
  };

  const mediaOptions: { type: MediaType | 'all'; label: string }[] = [
    { type: 'all', label: 'Everything' },
    { type: 'anime', label: 'Anime' },
    { type: 'manga', label: 'Manga' },
    { type: 'book', label: 'Books' },
    { type: 'game', label: 'Games' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top breadcrumb & media scope selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="font-semibold text-neutral-300">Discovery Mode</span>
          <span>·</span>
          <span>Question {Math.min(questionIndex + 1, DISCOVERY_QUESTIONS.length)} of 3</span>
        </div>

        {/* Medium Filter Scope (Defaults to Everything) */}
        <div className="flex items-center gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800 text-xs">
          {mediaOptions.map((opt) => {
            const isSelected =
              opt.type === 'all'
                ? currentItch.preferred_media.length === 0
                : currentItch.preferred_media.includes(opt.type);

            return (
              <button
                key={opt.type}
                onClick={() => {
                  if (opt.type === 'all') {
                    updateItchProfile({ preferred_media: [] });
                  } else {
                    updateItchProfile({ preferred_media: [opt.type] });
                  }
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  isSelected ? 'bg-amber-400 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main card */}
      <div className="mt-8 bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        {/* Ambient subtle glow background */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {isConfident ? (
          /* Ready Screen */
          <div className="text-center py-6 space-y-6 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-neutral-100 tracking-tight">
                I think I&apos;ve got your itch.
              </h2>
              <p className="text-neutral-400 text-sm max-w-md mx-auto">
                {reflectionMessage ||
                  "Based on your brain state and cravings, I've locked in your experience profile."}
              </p>
            </div>

            {/* Live Slider Snapshot */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-left max-w-lg mx-auto">
              <div>
                <p className="text-[11px] text-neutral-400 uppercase font-semibold">Stimulation</p>
                <p className="text-sm font-bold text-amber-400 mt-0.5">
                  {currentItch.stimulation >= 8 ? '⚡ High' : currentItch.stimulation <= 3 ? '🌿 Calm' : '⚖️ Balanced'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 uppercase font-semibold">Effort</p>
                <p className="text-sm font-bold text-amber-400 mt-0.5">
                  {currentItch.cognitive_load <= 3 ? '🫠 Brain-off' : currentItch.cognitive_load >= 7 ? '🧠 Heavy' : 'Engaged'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 uppercase font-semibold">Commitment</p>
                <p className="text-sm font-bold text-amber-400 mt-0.5">
                  {currentItch.commitment_tolerance <= 3 ? '☕ Tonight' : '🚀 Deep'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={handleFinishDiscovery}
                className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 text-base"
              >
                <span>Reveal Best Match</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveView('sliders')}
                className="w-full sm:w-auto px-5 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm border border-neutral-700"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Fine-tune sliders first</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Question Step */
          <div className="space-y-8 animate-fadeIn">
            {/* The Question */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 tracking-tight leading-snug">
                {currentQ.prompt}
              </h2>
              {currentQ.subtext && (
                <p className="text-sm text-neutral-400">{currentQ.subtext}</p>
              )}
            </div>

            {/* Quick-Pick Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  className="p-4 rounded-2xl bg-neutral-950/60 hover:bg-neutral-900 border border-neutral-800/90 hover:border-amber-400/40 text-left transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-neutral-200 text-base group-hover:text-amber-400 transition-colors">
                      {opt.label}
                    </span>
                    <span className="text-neutral-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all text-sm">
                      →
                    </span>
                  </div>
                  {opt.subtitle && (
                    <p className="text-xs text-neutral-400 leading-relaxed">{opt.subtitle}</p>
                  )}
                </button>
              ))}
            </div>

            {/* Natural language freeform prompt */}
            <div className="pt-4 border-t border-neutral-800/80">
              <p className="text-xs text-neutral-400 mb-2">
                Or describe what&apos;s going on in your own words:
              </p>
              <form onSubmit={handleNaturalSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={naturalInput}
                  onChange={(e) => setNaturalInput(e.target.value)}
                  placeholder="e.g. 'I am totally exhausted, need something funny that hooks me fast'"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-amber-400 transition-colors pr-12"
                  disabled={isAnalyzing}
                />
                <button
                  type="submit"
                  disabled={!naturalInput.trim() || isAnalyzing}
                  className="absolute right-2 p-2 rounded-lg bg-neutral-800 hover:bg-amber-400 text-neutral-300 hover:text-neutral-950 disabled:opacity-40 disabled:hover:bg-neutral-800 disabled:hover:text-neutral-300 transition-colors"
                >
                  <CornerDownLeft className="w-4 h-4" />
                </button>
              </form>

              {isAnalyzing && (
                <div className="flex items-center gap-2 text-xs text-amber-400 mt-2 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Itch AI is analyzing your brain state...</span>
                </div>
              )}

              {reflectionMessage && !isAnalyzing && (
                <p className="text-xs text-neutral-300 mt-2 italic bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800">
                  {reflectionMessage}
                </p>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-2">
              <button
                onClick={() => {
                  setQuestionIndex(0);
                  setAnsweredCount(0);
                  setIsConfident(false);
                }}
                className="hover:text-neutral-200 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Start over
              </button>

              <button
                onClick={() => setActiveView('sliders')}
                className="hover:text-amber-400 flex items-center gap-1 font-medium"
              >
                <span>Skip to manual sliders</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
