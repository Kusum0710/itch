import React, { useState } from 'react';
import { useItch } from '../context/ItchContext';
import { MOCK_CATALOG } from '../data/mockCatalog';
import { MediaItem, MediaType } from '../types';
import { Search, Sparkles, Clock, Heart } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const { setSelectedMediaDetail, saveToLibrary, isMediaSaved } = useItch();

  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [experienceTagFilter, setExperienceTagFilter] = useState<string | null>(null);

  const filterChips = [
    { label: 'High Stimulation ⚡', check: (m: MediaItem) => m.experience.stimulation >= 8 },
    { label: 'Brain-Off 🫠', check: (m: MediaItem) => m.experience.cognitive_load <= 3 },
    { label: 'Deep Lore 🌌', check: (m: MediaItem) => m.experience.world_building >= 9 },
    { label: 'Pure Comfort 🍵', check: (m: MediaItem) => m.experience.comfort >= 8 },
    { label: 'Mind Bending 🔍', check: (m: MediaItem) => m.experience.mystery >= 8 },
    { label: 'Relentless Pace 🏎️', check: (m: MediaItem) => m.experience.pacing >= 8 },
  ];

  const filteredMedia = MOCK_CATALOG.filter((item) => {
    if (selectedType !== 'all' && item.type !== selectedType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.genres.some((g) => g.toLowerCase().includes(q)) ||
        item.themes.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (experienceTagFilter) {
      const chip = filterChips.find((c) => c.label === experienceTagFilter);
      if (chip && !chip.check(item)) {
        return false;
      }
    }
    return true;
  });

  const mediaTabs: { type: MediaType | 'all'; label: string }[] = [
    { type: 'all', label: 'All Media' },
    { type: 'anime', label: 'Anime' },
    { type: 'manga', label: 'Manga' },
    { type: 'book', label: 'Books' },
    { type: 'game', label: 'Games' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
            Catalog &amp; Fingerprints
          </span>
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">
            Explore by Experience
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Browse media mapped to cognitive load, pacing, and stimulation fingerprints.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, themes, vibe..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Media Type Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
          {mediaTabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setSelectedType(tab.type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedType === tab.type
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Experience Fingerprint Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {filterChips.map((chip) => {
            const isActive = experienceTagFilter === chip.label;
            return (
              <button
                key={chip.label}
                onClick={() => setExperienceTagFilter(isActive ? null : chip.label)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  isActive
                    ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Media */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedia.map((item) => {
          const isSaved = isMediaSaved(item.id);

          return (
            <div
              key={item.id}
              className="bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 rounded-2xl p-4 transition-all shadow-md flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div
                  className="aspect-[16/9] w-full rounded-xl overflow-hidden relative cursor-pointer bg-neutral-950"
                  onClick={() => setSelectedMediaDetail(item)}
                >
                  <img
                    src={item.cover_image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-neutral-950/80 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-400 capitalize border border-neutral-800">
                    {item.type}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-neutral-950/80 px-2 py-0.5 rounded-md text-[10px] text-neutral-300 flex items-center gap-1 border border-neutral-800">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{item.runtime_estimate}</span>
                  </div>
                </div>

                <div>
                  <h3
                    onClick={() => setSelectedMediaDetail(item)}
                    className="font-bold text-base text-neutral-100 hover:text-amber-400 cursor-pointer transition-colors leading-snug"
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-amber-300/80 italic mt-0.5 line-clamp-1">
                    {item.tagline}
                  </p>
                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Experience Mini Bars */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 text-[10px] text-neutral-400">
                  <div className="p-1.5 rounded-md bg-neutral-950 border border-neutral-800/80 text-center">
                    <span className="block font-semibold">⚡ Stim</span>
                    <span className="font-mono text-amber-400">{item.experience.stimulation}/10</span>
                  </div>
                  <div className="p-1.5 rounded-md bg-neutral-950 border border-neutral-800/80 text-center">
                    <span className="block font-semibold">🫠 Effort</span>
                    <span className="font-mono text-amber-400">{item.experience.cognitive_load}/10</span>
                  </div>
                  <div className="p-1.5 rounded-md bg-neutral-950 border border-neutral-800/80 text-center">
                    <span className="block font-semibold">🏎️ Pace</span>
                    <span className="font-mono text-amber-400">{item.experience.pacing}/10</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-800">
                <button
                  onClick={() => setSelectedMediaDetail(item)}
                  className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Inspect Fingerprint</span>
                </button>

                <button
                  onClick={() => saveToLibrary(item, 'saved')}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isSaved
                      ? 'text-rose-400 border-rose-800/40 bg-rose-950/40'
                      : 'text-neutral-400 hover:text-neutral-200 border-neutral-800'
                  }`}
                  title="Save to Library"
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
