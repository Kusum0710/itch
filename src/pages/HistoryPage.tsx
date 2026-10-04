import React from 'react';
import { useItch } from '../context/ItchContext';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { historySessions, loadHistorySession, setActiveView } = useItch();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-800">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
          Session Archive
        </span>
        <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">
          Past Recommendation Sessions
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Review the states your brain was in and reload any itch with one click.
        </p>
      </div>

      {historySessions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-3">
          <Clock className="w-8 h-8 text-neutral-400 mx-auto" />
          <p className="text-neutral-400 text-sm">No past sessions recorded yet.</p>
          <button
            onClick={() => setActiveView('discovery')}
            className="px-4 py-2 bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl"
          >
            Start your first discovery
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {historySessions.map((session) => {
            const dateStr = new Date(session.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const best = session.recommendations.bestMatch;

            return (
              <div
                key={session.id}
                className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={best.media.cover_image}
                    alt={best.media.title}
                    className="w-14 h-20 object-cover rounded-xl border border-neutral-800 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                      <span>{dateStr}</span>
                      <span>·</span>
                      <span className="capitalize font-semibold text-amber-400">
                        {best.media.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-neutral-100">
                      {best.media.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-1 max-w-md">
                      {best.why_this}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-amber-400 block">
                      {best.overall_score}% match
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Stim {session.itch_profile.stimulation} · Effort {session.itch_profile.cognitive_load}
                    </span>
                  </div>

                  <button
                    onClick={() => loadHistorySession(session)}
                    className="px-4 py-2 bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Re-itch</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
