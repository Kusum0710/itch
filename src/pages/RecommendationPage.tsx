import React, { useState } from 'react';
import { useItch } from '../context/ItchContext';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import { ExperienceSliders } from '../components/sliders/ExperienceSliders';
import { SlidersHorizontal, RefreshCw, Compass } from 'lucide-react';

export const RecommendationPage: React.FC = () => {
  const { recommendations, refreshRecommendations, setActiveView } = useItch();
  const [showSlidersPanel, setShowSlidersPanel] = useState(false);

  if (!recommendations) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <p className="text-neutral-400">Hmm. Nothing quite fits yet. Let&apos;s start an itch session.</p>
        <button
          onClick={() => setActiveView('discovery')}
          className="px-6 py-3 bg-amber-400 text-neutral-950 font-bold rounded-xl"
        >
          Start Discovery
        </button>
      </div>
    );
  }

  const { bestMatch, backup, wildcard } = recommendations;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Top action strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
            Recommendations
          </span>
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">
            I think I found your itch.
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSlidersPanel(!showSlidersPanel)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              showSlidersPanel
                ? 'bg-amber-400 text-neutral-950 border-amber-400'
                : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-600'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showSlidersPanel ? 'Hide Sliders' : 'Fine-Tune Sliders'}</span>
          </button>

          <button
            onClick={refreshRecommendations}
            className="p-2 text-neutral-400 hover:text-neutral-200 rounded-xl border border-neutral-800 hover:bg-neutral-900 transition-colors"
            title="Recalculate matches"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveView('discovery')}
            className="px-3.5 py-2 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl border border-neutral-800 transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>New Itch</span>
          </button>
        </div>
      </div>

      {/* Expandable Live Sliders Drawer */}
      {showSlidersPanel && (
        <div className="p-6 rounded-3xl bg-neutral-950/80 border border-neutral-800 animate-fadeIn">
          <ExperienceSliders compact={true} />
        </div>
      )}

      {/* 1. HERO BEST MATCH (Primary) */}
      <section className="space-y-4">
        <RecommendationCard item={bestMatch} isHero={true} />
      </section>

      {/* 2. BACKUP & WILDCARD (Only 2 complementary options) */}
      <section className="space-y-4 pt-4 border-t border-neutral-800/80">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Alternative Angles (Backup &amp; Wildcard)
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            If the best match isn&apos;t hitting the spot, try a safer classic or an unexpected cross-medium curveball.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecommendationCard item={backup} />
          <RecommendationCard item={wildcard} />
        </div>
      </section>
    </div>
  );
};
