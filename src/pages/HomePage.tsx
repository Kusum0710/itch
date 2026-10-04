import React from 'react';
import { useItch } from '../context/ItchContext';
import { Sparkles, Compass, Sliders, ArrowRight } from 'lucide-react';
import { MediaType, CurrentItchProfile } from '../types';

export const HomePage: React.FC = () => {
  const { startDiscovery, setActiveView, updateItchProfile, currentItch } = useItch();

  const quickCravings = [
    {
      title: 'Brain is fried',
      subtitle: 'Zero thinking · maximum comfort · bite-sized',
      effects: { cognitive_load: 2, comfort: 9, stimulation: 4, commitment_tolerance: 2 },
    },
    {
      title: 'Need a dopamine jolt',
      subtitle: 'Electric pacing · instant hook · high stimulation',
      effects: { stimulation: 10, pacing: 9, hook_strength: 10, cognitive_load: 3 },
    },
    {
      title: 'Total escapism',
      subtitle: 'Deep atmosphere · rich world · forget reality',
      effects: { immersion: 10, world_building: 9, commitment_tolerance: 7 },
    },
    {
      title: 'Mind-bending puzzle',
      subtitle: 'Existential secrets · make me think · surprise me',
      effects: { mystery: 9, cognitive_load: 8, novelty: 9, predictability: 2 },
    },
  ];

  const mediaOptions: { type: MediaType | 'all'; label: string }[] = [
    { type: 'all', label: 'Everything' },
    { type: 'anime', label: 'Anime' },
    { type: 'manga', label: 'Manga' },
    { type: 'book', label: 'Books' },
    { type: 'game', label: 'Games' },
  ];

  const handleQuickCraving = (effects: Partial<CurrentItchProfile>) => {
    updateItchProfile(effects);
    setActiveView('sliders');
  };

  return (
    <div className="space-y-16 py-12 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <section className="text-center space-y-8 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Not a traditional search engine. We discover your experience.</span>
        </div>

        {/* Core Heading & Subheading from Product Brief */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black text-neutral-100 tracking-tight leading-tight">
            What are you <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">craving</span>?
          </h1>
          <p className="text-base sm:text-xl text-neutral-400 leading-relaxed font-normal max-w-2xl mx-auto">
            You don&apos;t have to know. Tell me what&apos;s going on, and I&apos;ll figure it out.
          </p>
        </div>

        {/* Media Scope Filter (Defaults to Everything) */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-neutral-100 text-neutral-950 font-bold shadow-md'
                    : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Primary & Secondary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={startDiscovery}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-neutral-950 font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.02] flex items-center justify-center gap-2.5"
          >
            <Sparkles className="w-5 h-5 text-neutral-950" />
            <span>Find my itch</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={() => setActiveView('explore')}
            className="w-full sm:w-auto px-6 py-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 font-semibold text-sm rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-neutral-400" />
            <span>I know exactly what I want</span>
          </button>
        </div>
      </section>

      {/* Quick-Craving Launchers */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Quick Craving Jump-Starts
          </h3>
          <button
            onClick={() => setActiveView('sliders')}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom sliders</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickCravings.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickCraving(item.effects)}
              className="p-5 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-amber-400/40 text-left transition-all group flex flex-col justify-between"
            >
              <div className="space-y-1">
                <span className="text-base font-bold text-neutral-200 group-hover:text-amber-400 transition-colors">
                  {item.title}
                </span>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>
              <span className="text-xs font-semibold text-neutral-400 group-hover:text-amber-400 mt-4 flex items-center gap-1">
                Scrape this itch →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* The Core Itch Philosophy & Architecture Loop */}
      <section className="p-8 sm:p-10 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 space-y-6">
        <div className="space-y-2 text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            The Recommendation Loop
          </span>
          <h2 className="text-2xl font-bold text-neutral-100">
            Designed for decision fatigue
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Traditional algorithms ask for favorite genres and dump 50 results. Itch asks how your brain is doing, visualizes it with sliders, and adapts to your natural feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
            <span className="text-amber-400 font-mono text-xs font-bold">01. Discovery</span>
            <h4 className="text-sm font-semibold text-neutral-200">One Question At A Time</h4>
            <p className="text-xs text-neutral-400">No giant forms. Adaptive questions discover brain state, stamina, and pacing cravings.</p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
            <span className="text-amber-400 font-mono text-xs font-bold">02. Sliders</span>
            <h4 className="text-sm font-semibold text-neutral-200">AI Guesses → You Adjust</h4>
            <p className="text-xs text-neutral-400">Experience sliders visualize your exact cognitive and emotional appetite without arbitrary numbers.</p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
            <span className="text-amber-400 font-mono text-xs font-bold">03. Triad Match</span>
            <h4 className="text-sm font-semibold text-neutral-200">Best Match + 2 Alternatives</h4>
            <p className="text-xs text-neutral-400">Never get buried under options. One best match, one safer backup, and one wildcard.</p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
            <span className="text-amber-400 font-mono text-xs font-bold">04. Feedback</span>
            <h4 className="text-sm font-semibold text-neutral-200">&ldquo;No, But...&rdquo; Loop</h4>
            <p className="text-xs text-neutral-400">Say &ldquo;too serious&rdquo; or &ldquo;too slow&rdquo;—the engine learns the nuance without blacklisting.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
