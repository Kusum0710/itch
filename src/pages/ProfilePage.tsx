import React, { useState } from 'react';
import { useItch } from '../context/ItchContext';
import { Plus, X, Sparkles, MessageSquareQuote } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { userTaste, updateTasteLike, updateTasteDislike, currentItch } = useItch();
  const [newLikeInput, setNewLikeInput] = useState('');
  const [newDislikeInput, setNewDislikeInput] = useState('');

  const handleAddLike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLikeInput.trim()) return;
    updateTasteLike(newLikeInput.trim().toLowerCase());
    setNewLikeInput('');
  };

  const handleAddDislike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDislikeInput.trim()) return;
    updateTasteDislike(newDislikeInput.trim().toLowerCase());
    setNewDislikeInput('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-800">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
          Personalized Engine
        </span>
        <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">
          Learned Taste vs. Current Itch
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          How Itch separates what you generally love from what you need right at this moment.
        </p>
      </div>

      {/* Conceptual Contrast Box: What I generally like vs What I need right now */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <span>🧬 Long-Term Baseline Taste</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-200">What I Generally Like</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Your recurring affinities for world-building, dark humor, or specific narrative tropes. These persist across all sessions and protect against generic recommendations.
          </p>
          <div className="pt-2 text-xs text-amber-400 font-medium">
            {userTaste.likes.length} active affinities · {userTaste.dislikes.length} excluded patterns
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Ephemeral Session State</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-200">What I Need Right Now</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Even if you normally love 1,000-page high fantasy or psychological thrillers, when you are exhausted tonight, the current session overrides your baseline without corrupting it.
          </p>
          <div className="pt-2 text-xs text-neutral-400">
            Active Session: Stim {currentItch.stimulation}/10 · Effort {currentItch.cognitive_load}/10 · Pace {currentItch.pacing}/10
          </div>
        </div>
      </div>

      {/* Likes & Affinities */}
      <section className="space-y-4 p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800">
        <div>
          <h3 className="text-base font-bold text-neutral-200">Long-Term Preferences &amp; Themes</h3>
          <p className="text-xs text-neutral-400">Things you consistently enjoy across all media.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userTaste.likes.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-950 text-neutral-200 text-xs border border-neutral-800"
            >
              <span>{tag}</span>
              <button
                onClick={() => updateTasteLike(tag)}
                className="text-neutral-400 hover:text-rose-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddLike} className="flex gap-2 max-w-sm pt-2">
          <input
            type="text"
            value={newLikeInput}
            onChange={(e) => setNewLikeInput(e.target.value)}
            placeholder="Add an affinity (e.g. 'unreliable narrator')"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl border border-neutral-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </section>

      {/* Dislikes & Pet Peeves */}
      <section className="space-y-4 p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800">
        <div>
          <h3 className="text-base font-bold text-neutral-200">Pet Peeves &amp; Turn-offs</h3>
          <p className="text-xs text-neutral-400">Tropes or traits that instantly spoil an experience for you.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userTaste.dislikes.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/20 text-rose-300 text-xs border border-rose-900/40"
            >
              <span>{tag}</span>
              <button
                onClick={() => updateTasteDislike(tag)}
                className="text-rose-400 hover:text-rose-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddDislike} className="flex gap-2 max-w-sm pt-2">
          <input
            type="text"
            value={newDislikeInput}
            onChange={(e) => setNewDislikeInput(e.target.value)}
            placeholder="Add a pet peeve (e.g. 'love triangles')"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl border border-neutral-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </section>

      {/* Feedback Archive ("liked it but...", "not this because...") */}
      <section className="space-y-4 p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-bold text-neutral-200">Refinement Signals Archive</h3>
        </div>
        <p className="text-xs text-neutral-400">
          Nuanced feedback you gave on specific titles. The engine uses these to avoid similar mismatches.
        </p>

        {userTaste.interaction_history.feedback_notes.length === 0 ? (
          <p className="text-xs text-neutral-400 italic">No &ldquo;No, but...&rdquo; notes recorded yet. They will appear here whenever you refine a recommendation.</p>
        ) : (
          <div className="space-y-2">
            {userTaste.interaction_history.feedback_notes.map((note, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="font-semibold text-neutral-200">{note.mediaTitle}</span>
                  <span className="text-[10px]">{new Date(note.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-amber-300 italic">&ldquo;{note.note}&rdquo;</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
