import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-neutral-800/60 bg-neutral-950 py-12 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-200 tracking-tight">Itch</span>
              <span className="text-xs text-neutral-400">· Experience-First Discovery</span>
            </div>
            <p className="text-xs text-neutral-400 max-w-md">
              You don&apos;t have to know what you want. We figure out the experience, then find the exact anime, manga, book, or game to match it.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400">
            <span>Adaptive Engine</span>
            <span aria-hidden="true">·</span>
            <span>Zero Slop</span>
            <span aria-hidden="true">·</span>
            <span>Cross-Media Fingerprints</span>
            <span aria-hidden="true">·</span>
            <span>Supabase + Gemini 3.8</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} Itch Recommendation Systems. Built for focus, calm, and discovery.</p>
          <p className="italic">Ground explanations in your cravings, never diagnoses.</p>
        </div>
      </div>
    </footer>
  );
};
