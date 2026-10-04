import React, { useState } from 'react';
import { useItch } from '../context/ItchContext';
import { MediaType } from '../types';
import { Bookmark, CheckCircle2, XCircle, Trash2, Sparkles, Clock } from 'lucide-react';

export const LibraryPage: React.FC = () => {
  const { library, removeFromLibrary, setSelectedMediaDetail, updateItchProfile, setActiveView } = useItch();
  const [activeTab, setActiveTab] = useState<'saved' | 'finished' | 'dropped'>('saved');
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');

  const currentList = library[activeTab] || [];
  const filteredList = typeFilter === 'all' ? currentList : currentList.filter((m) => m.type === typeFilter);

  const mediaTabs: { type: MediaType | 'all'; label: string }[] = [
    { type: 'all', label: 'All' },
    { type: 'anime', label: 'Anime' },
    { type: 'manga', label: 'Manga' },
    { type: 'book', label: 'Books' },
    { type: 'game', label: 'Games' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-800">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
          Personal Stash
        </span>
        <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">
          Your Library
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Everything you&apos;ve saved, consumed, or dismissed across your sessions.
        </p>
      </div>

      {/* Primary Category Tabs: Saved, Finished, Dropped */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'saved' ? 'bg-amber-400 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({library.saved.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('finished')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'finished' ? 'bg-amber-400 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Finished ({library.finished.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dropped')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'dropped' ? 'bg-amber-400 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Not for Me ({library.dropped.length})</span>
          </button>
        </div>

        {/* Media Type Sub-Filter */}
        <div className="flex items-center gap-1 text-xs">
          {mediaTabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setTypeFilter(tab.type)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                typeFilter === tab.type ? 'text-amber-400 font-bold bg-neutral-900' : 'text-neutral-400 hover:text-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List / Grid */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-3">
          <p className="text-neutral-400 text-sm">No items in this shelf yet.</p>
          <button
            onClick={() => setActiveView('discovery')}
            className="px-4 py-2 bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl"
          >
            Discover Something Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              <div className="flex gap-3">
                <img
                  src={item.cover_image}
                  alt={item.title}
                  onClick={() => setSelectedMediaDetail(item)}
                  className="w-16 h-24 object-cover rounded-xl border border-neutral-800 shrink-0 cursor-pointer hover:opacity-90"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                    <span className="capitalize font-semibold text-amber-400">{item.type}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {item.runtime_estimate}
                    </span>
                  </div>
                  <h4
                    onClick={() => setSelectedMediaDetail(item)}
                    className="font-bold text-sm text-neutral-100 hover:text-amber-400 cursor-pointer transition-colors leading-tight"
                  >
                    {item.title}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-2">{item.tagline}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-800 text-xs">
                <button
                  onClick={() => {
                    updateItchProfile({
                      stimulation: item.experience.stimulation,
                      cognitive_load: item.experience.cognitive_load,
                      pacing: item.experience.pacing,
                      comfort: item.experience.comfort,
                    });
                    setActiveView('sliders');
                  }}
                  className="text-neutral-400 hover:text-amber-400 flex items-center gap-1 text-[11px]"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Find more like this</span>
                </button>

                <button
                  onClick={() => removeFromLibrary(item.id)}
                  className="text-neutral-400 hover:text-rose-400 p-1 rounded-md transition-colors"
                  title="Remove from list"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
