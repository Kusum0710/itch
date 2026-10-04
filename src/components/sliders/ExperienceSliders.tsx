import React, { useState } from 'react';
import { useItch } from '../../context/ItchContext';
import { CurrentItchProfile } from '../../types';
import { ChevronDown, ChevronUp, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';

interface SliderConfig {
  key: keyof CurrentItchProfile;
  label: string;
  leftAnchor: { icon: string; text: string };
  rightAnchor: { icon: string; text: string };
  description: string;
  positions: { value: number; label: string }[];
}

const CORE_SLIDERS: SliderConfig[] = [
  {
    key: 'stimulation',
    label: 'ENERGY & STIMULATION',
    leftAnchor: { icon: '🌿', text: 'Calm / Ambient' },
    rightAnchor: { icon: '⚡', text: 'Explosive / Overdrive' },
    description: 'How loud, intense, or adrenaline-heavy does the sensory experience need to be?',
    positions: [
      { value: 1, label: 'Whisper calm' },
      { value: 3, label: 'Mellow flow' },
      { value: 5, label: 'Balanced groove' },
      { value: 7, label: 'High energy' },
      { value: 9, label: 'Pure adrenaline' },
      { value: 10, label: 'Electric overdrive' },
    ],
  },
  {
    key: 'cognitive_load',
    label: 'MENTAL EFFORT',
    leftAnchor: { icon: '🫠', text: 'Brain-off' },
    rightAnchor: { icon: '🧠', text: 'Make me think' },
    description: 'How much cognitive friction and complex puzzle-solving can your brain handle?',
    positions: [
      { value: 1, label: 'Zero thoughts' },
      { value: 2, label: 'Brain-off relaxation' },
      { value: 4, label: 'Effortless absorption' },
      { value: 6, label: 'Engaged & attentive' },
      { value: 8, label: 'Intellectual workout' },
      { value: 10, label: 'Destroy me cerebrally' },
    ],
  },
  {
    key: 'commitment_tolerance',
    label: 'COMMITMENT HORIZON',
    leftAnchor: { icon: '☕', text: 'One sitting' },
    rightAnchor: { icon: '🚀', text: 'New obsession' },
    description: 'Are we doing a 30-minute snack, an evening wrap-up, or a multi-week life takeover?',
    positions: [
      { value: 1, label: 'Quick bite (20m)' },
      { value: 3, label: 'One sitting / Tonight' },
      { value: 5, label: 'A tight weekend' },
      { value: 7, label: 'Deep commitment' },
      { value: 9, label: 'Sprawling universe' },
      { value: 10, label: 'Full life obsession' },
    ],
  },
];

const ADVANCED_SLIDERS: SliderConfig[] = [
  {
    key: 'emotional_intensity',
    label: 'EMOTIONAL INTENSITY',
    leftAnchor: { icon: '🍵', text: 'Comforting' },
    rightAnchor: { icon: '💔', text: 'Emotionally devastating' },
    description: 'How deep do you want the feelings to cut?',
    positions: [
      { value: 1, label: 'Pure fluff' },
      { value: 3, label: 'Gentle warmth' },
      { value: 5, label: 'Meaningful stakes' },
      { value: 7, label: 'Deeply touching' },
      { value: 9, label: 'Heart-wrenching' },
      { value: 10, label: 'Sobbing on the floor' },
    ],
  },
  {
    key: 'pacing',
    label: 'PACING',
    leftAnchor: { icon: '🕯️', text: 'Slow burn' },
    rightAnchor: { icon: '🏎️', text: 'Relentless' },
    description: 'How urgently does the narrative move forward?',
    positions: [
      { value: 1, label: 'Meditative stillness' },
      { value: 3, label: 'Patient simmer' },
      { value: 5, label: 'Steady momentum' },
      { value: 7, label: 'Brisk & gripping' },
      { value: 9, label: 'Unstoppable blitz' },
      { value: 10, label: 'White knuckle sprint' },
    ],
  },
  {
    key: 'novelty',
    label: 'NOVELTY & WEIRDNESS',
    leftAnchor: { icon: '🛋️', text: 'Familiar comfort tropes' },
    rightAnchor: { icon: '🌀', text: 'Weird / Unexpected' },
    description: 'Do you want comfortable predictability or mind-bending strangeness?',
    positions: [
      { value: 1, label: 'Classic comfort food' },
      { value: 3, label: 'Familiar genre tropes' },
      { value: 5, label: 'Fresh spin' },
      { value: 7, label: 'Unconventional' },
      { value: 9, label: 'Bizarre & inventive' },
      { value: 10, label: 'Pure surreal anomaly' },
    ],
  },
  {
    key: 'immersion',
    label: 'IMMERSION DEPTH',
    leftAnchor: { icon: '🎧', text: 'Casual pick-up' },
    rightAnchor: { icon: '🌌', text: 'I want to disappear' },
    description: 'Light entertainment or full sensory world-absorption?',
    positions: [
      { value: 1, label: 'Background friendly' },
      { value: 3, label: 'Casual immersion' },
      { value: 5, label: 'Enveloping' },
      { value: 7, label: 'Deep atmosphere' },
      { value: 9, label: 'Forget reality exists' },
      { value: 10, label: 'Complete transcendence' },
    ],
  },
  {
    key: 'mystery',
    label: 'MYSTERY & UNCERTAINTY',
    leftAnchor: { icon: '📖', text: 'Straightforward' },
    rightAnchor: { icon: '🔍', text: 'Make me figure it out' },
    description: 'How many secrets, twists, and unanswered questions do you crave?',
    positions: [
      { value: 1, label: 'Crystal clear' },
      { value: 3, label: 'Simple intrigue' },
      { value: 5, label: 'Curious puzzle' },
      { value: 7, label: 'Conspiracy web' },
      { value: 9, label: 'Total rabbit hole' },
      { value: 10, label: 'Mind-bending puzzle box' },
    ],
  },
  {
    key: 'humor',
    label: 'HUMOR LEVEL',
    leftAnchor: { icon: '🗿', text: 'Dead serious' },
    rightAnchor: { icon: '🤡', text: 'Completely ridiculous' },
    description: 'Tone balance: grim weight vs. unhinged laughs.',
    positions: [
      { value: 1, label: 'Stone faced' },
      { value: 3, label: 'Quiet dry wit' },
      { value: 5, label: 'Balanced banter' },
      { value: 7, label: 'Genuinely hilarious' },
      { value: 9, label: 'Laugh-out-loud chaos' },
      { value: 10, label: 'Absurdist delirium' },
    ],
  },
  {
    key: 'predictability',
    label: 'PREDICTABILITY',
    leftAnchor: { icon: '🎯', text: 'Give me what I expect' },
    rightAnchor: { icon: '🎲', text: 'Surprise me' },
    description: 'Safety in established patterns vs. narrative rug-pulls.',
    positions: [
      { value: 1, label: 'Radical shocks' },
      { value: 3, label: 'Clever subversions' },
      { value: 5, label: 'Healthy surprises' },
      { value: 7, label: 'Comforting patterns' },
      { value: 9, label: 'Guaranteed satisfaction' },
      { value: 10, label: 'Formula perfected' },
    ],
  },
  {
    key: 'stakes',
    label: 'STAKES',
    leftAnchor: { icon: '🪴', text: 'Low stakes cozy' },
    rightAnchor: { icon: '🔥', text: 'Everything is on fire' },
    description: 'Are we making coffee or saving the solar system from collapse?',
    positions: [
      { value: 1, label: 'Cozy everyday life' },
      { value: 3, label: 'Personal drama' },
      { value: 5, label: 'City / Community stakes' },
      { value: 7, label: 'Life or death' },
      { value: 9, label: 'Fate of civilization' },
      { value: 10, label: 'Cosmic apocalypse' },
    ],
  },
];

export const ExperienceSliders: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { currentItch, updateItchDimension, resetItchProfile, setActiveView, recommendations } = useItch();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getPositionLabel = (config: SliderConfig, value: number) => {
    // Find closest defined position
    let closest = config.positions[0];
    let minDiff = Math.abs(value - closest.value);
    for (const p of config.positions) {
      const diff = Math.abs(value - p.value);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    }
    return closest.label;
  };

  const renderSlider = (config: SliderConfig) => {
    const rawVal = (currentItch[config.key] as number) ?? 5;
    const currentLabel = getPositionLabel(config, rawVal);

    // Percentage for track highlight
    const pct = ((rawVal - 1) / 9) * 100;

    return (
      <div key={config.key} className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 transition-all hover:border-neutral-700/80">
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            {config.label}
          </span>
          <span className="text-xs font-medium text-amber-400 bg-amber-950/40 px-2.5 py-0.5 rounded-md border border-amber-800/40">
            {currentLabel}
          </span>
        </div>

        <p className="text-xs text-neutral-400 mb-4">{config.description}</p>

        {/* The Track & Thumb */}
        <div className="relative py-2">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={rawVal}
            onChange={(e) => updateItchDimension(config.key, Number(e.target.value))}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            style={{
              background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${pct}%, #262626 ${pct}%, #262626 100%)`,
            }}
          />
        </div>

        {/* Anchors with Icons */}
        <div className="flex items-center justify-between text-xs text-neutral-400 mt-2">
          <span className="flex items-center gap-1.5 hover:text-neutral-200 transition-colors">
            <span>{config.leftAnchor.icon}</span>
            <span>{config.leftAnchor.text}</span>
          </span>
          <span className="flex items-center gap-1.5 hover:text-neutral-200 transition-colors text-right">
            <span>{config.rightAnchor.text}</span>
            <span>{config.rightAnchor.icon}</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
        <div>
          <h2 className="text-2xl font-bold text-neutral-100 tracking-tight flex items-center gap-2">
            <span>Experience Sliders</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Move any slider to feel the recommendations adapt in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetItchProfile}
            className="text-xs text-neutral-400 hover:text-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to default
          </button>

          {recommendations && (
            <button
              onClick={() => setActiveView('recommendations')}
              className="text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-neutral-950 px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <span>View Matches ({recommendations.bestMatch.overall_score}% match)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Core Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CORE_SLIDERS.map(renderSlider)}
      </div>

      {/* Advanced disclosure toggle */}
      <div className="pt-2">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full py-3 px-4 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 text-neutral-300 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <span>{showAdvanced ? 'Hide fine-tuning dimensions' : 'Show 8 advanced experience dimensions'}</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      {/* Advanced Sliders */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
          {ADVANCED_SLIDERS.map(renderSlider)}
        </div>
      )}

      {/* Floating or anchored Match Banner */}
      {recommendations && !compact && (
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/30 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <img
              src={recommendations.bestMatch.media.cover_image}
              alt={recommendations.bestMatch.media.title}
              className="w-14 h-20 object-cover rounded-lg shadow-md border border-neutral-700"
            />
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                <span>★ CURRENT BEST MATCH</span>
                <span>·</span>
                <span className="uppercase text-neutral-400">{recommendations.bestMatch.media.type}</span>
              </div>
              <h4 className="text-lg font-bold text-neutral-100">{recommendations.bestMatch.media.title}</h4>
              <p className="text-xs text-neutral-400 line-clamp-1 max-w-xl">{recommendations.bestMatch.media.tagline}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('recommendations')}
            className="w-full md:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
          >
            <span>See Best Match & Alternatives</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
