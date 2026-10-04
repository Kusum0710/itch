import React from 'react';
import { useItch } from '../../context/ItchContext';
import { X, Heart, Clock, Sparkles } from 'lucide-react';

export const MediaDetailModal: React.FC = () => {
  const { selectedMediaDetail, setSelectedMediaDetail, saveToLibrary, isMediaSaved, updateItchProfile, setActiveView } = useItch();

  if (!selectedMediaDetail) return null;

  const item = selectedMediaDetail;
  const isSaved = isMediaSaved(item.id);

  const expKeys = [
    { key: 'stimulation', label: 'Stimulation' },
    { key: 'cognitive_load', label: 'Cognitive Load' },
    { key: 'emotional_intensity', label: 'Emotional Depth' },
    { key: 'comfort', label: 'Comfort' },
    { key: 'novelty', label: 'Novelty' },
    { key: 'immersion', label: 'Immersion' },
    { key: 'pacing', label: 'Pacing' },
    { key: 'mystery', label: 'Mystery' },
    { key: 'humor', label: 'Humor' },
    { key: 'character_attachment', label: 'Character Focus' },
    { key: 'predictability', label: 'Predictability' },
    { key: 'world_building', label: 'World Building' },
    { key: 'hook_strength', label: 'Hook Strength' },
    { key: 'commitment', label: 'Commitment' },
    { key: 'stakes', label: 'Stakes' },
  ] as const;

  const handleMatchThisVibe = () => {
    updateItchProfile({
      stimulation: item.experience.stimulation,
      cognitive_load: item.experience.cognitive_load,
      emotional_intensity: item.experience.emotional_intensity,
      pacing: item.experience.pacing,
      comfort: item.experience.comfort,
      humor: item.experience.humor,
      novelty: item.experience.novelty,
      immersion: item.experience.immersion,
    });
    setSelectedMediaDetail(null);
    setActiveView('sliders');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={() => setSelectedMediaDetail(null)}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
          <img
            src={item.cover_image}
            alt={item.title}
            className="w-28 sm:w-36 aspect-[2/3] object-cover rounded-2xl border border-neutral-800 shadow-xl shrink-0"
          />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="capitalize font-semibold text-amber-400">{item.type}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {item.runtime_estimate}
              </span>
              <span aria-hidden="true">·</span>
              <span>{item.metadata.year || item.release_date.slice(0, 4)}</span>
            </div>

            <h2 className="text-2xl font-bold text-neutral-100 tracking-tight">{item.title}</h2>
            <p className="text-xs text-amber-300 italic">&ldquo;{item.tagline}&rdquo;</p>
            <p className="text-xs text-neutral-300 leading-relaxed pt-1">{item.description}</p>
          </div>
        </div>

        {/* Genres & Themes */}
        <div className="space-y-3 py-4 border-t border-neutral-800">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Genres & Themes
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300">
              {[...item.genres, ...item.themes].map((tag, idx) => (
                <span key={idx} className="bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-800 text-[11px]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {item.content_warnings && item.content_warnings.length > 0 && (
            <div className="pt-2 text-xs text-orange-300">
              <span className="font-semibold text-orange-400">Content Notes: </span>
              {item.content_warnings.join(', ')}
            </div>
          )}
        </div>

        {/* 15-Dimension Experience Fingerprint */}
        <div className="py-4 border-t border-neutral-800">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-3">
            Experience Fingerprint (Internal Engine Model)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {expKeys.map(({ key, label }) => {
              const val = item.experience[key];
              const pct = (val / 10) * 100;

              return (
                <div key={key} className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                    <span>{label}</span>
                    <span className="font-mono text-amber-400 font-bold">{val}/10</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-neutral-800">
          <button
            onClick={handleMatchThisVibe}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tune sliders to this experience</span>
          </button>

          <button
            onClick={() => saveToLibrary(item, 'saved')}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isSaved
                ? 'bg-rose-500 text-white'
                : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved in Library' : 'Save to Library'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
