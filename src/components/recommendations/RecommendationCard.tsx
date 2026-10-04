import React, { useState } from 'react';
import { ScoredMediaItem } from '../../types';
import { useItch } from '../../context/ItchContext';
import { Heart, ThumbsDown, MessageSquareQuote, AlertTriangle, Clock, Info } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

interface RecommendationCardProps {
  item: ScoredMediaItem;
  isHero?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  isHero = false,
}) => {
  const { media, overall_score, explanation, why_this, possible_mismatch, role } = item;
  const { saveToLibrary, isMediaSaved, setSelectedMediaDetail } = useItch();

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [userLoved, setUserLoved] = useState(isMediaSaved(media.id));
  const [userDismissed, setUserDismissed] = useState(false);

  const handleLove = () => {
    saveToLibrary(media, 'saved');
    setUserLoved(true);
  };

  const handleNotForMe = () => {
    saveToLibrary(media, 'dropped');
    setUserDismissed(true);
  };

  if (userDismissed) {
    return (
      <div className="p-6 rounded-3xl bg-neutral-950/40 border border-neutral-800 text-center text-xs text-neutral-400">
        Removed &ldquo;{media.title}&rdquo; from your recommendations. We&apos;ll avoid this flavor in future sessions.
      </div>
    );
  }

  const roleBadgeText =
    role === 'best_match'
      ? '★ YOUR BEST MATCH'
      : role === 'backup'
      ? 'SHIELD / SAFER BACKUP'
      : 'WILDCARD / CURVEBALL';

  const roleBadgeStyle =
    role === 'best_match'
      ? 'text-amber-400 border-amber-500/40 bg-amber-950/40'
      : role === 'backup'
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40'
      : 'text-indigo-400 border-indigo-500/40 bg-indigo-950/40';

  if (isHero) {
    return (
      <>
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle warm glow background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top header row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className={`px-3 py-1 rounded-md text-xs font-bold tracking-wider border ${roleBadgeStyle}`}>
              {roleBadgeText}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-amber-400 tracking-tight">
                {overall_score}%
              </span>
              <span className="text-xs text-neutral-400 font-medium">match to your itch</span>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Poster / Cover */}
            <div className="md:col-span-4 relative group cursor-pointer" onClick={() => setSelectedMediaDetail(media)}>
              <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-xl border border-neutral-800 relative bg-neutral-950">
                <img
                  src={media.cover_image}
                  alt={media.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60" />

                <div className="absolute bottom-3 left-3 right-3 text-[11px] text-neutral-300 flex items-center justify-between">
                  <span className="capitalize font-semibold">{media.type}</span>
                  <span className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Details
                  </span>
                </div>
              </div>
            </div>

            {/* Description & Why this? */}
            <div className="md:col-span-8 space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                  <span className="capitalize font-medium text-neutral-300">{media.type}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    {media.runtime_estimate}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{media.metadata.year || media.release_date.slice(0, 4)}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 tracking-tight">
                  {media.title}
                </h2>
                <p className="text-sm font-medium text-amber-300/90 mt-1 italic">
                  &ldquo;{media.tagline}&rdquo;
                </p>
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed">
                {media.description}
              </p>

              {/* WHY THIS SECTION - Core requirement */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <span>Why this fits your itch:</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {why_this}
                </p>
                {explanation && (
                  <p className="text-xs text-neutral-400 italic pt-1">
                    {explanation}
                  </p>
                )}
              </div>

              {/* Possible mismatch warning */}
              {possible_mismatch && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-950/20 border border-orange-800/30 text-xs text-orange-300">
                  <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>{possible_mismatch}</span>
                </div>
              )}

              {/* Action Buttons: Love it, Not for me, No but... */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={handleLove}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    userLoved
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                      : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${userLoved ? 'fill-current' : ''}`} />
                  <span>{userLoved ? 'Saved to Library' : 'Love it / Save'}</span>
                </button>

                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <MessageSquareQuote className="w-4 h-4 text-amber-400" />
                  <span>&ldquo;No, but...&rdquo;</span>
                </button>

                <button
                  onClick={handleNotForMe}
                  className="px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 border border-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Not for me</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          mediaTitle={media.title}
        />
      </>
    );
  }

  // Backup & Wildcard cards
  return (
    <>
      <div className="bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 rounded-3xl p-5 sm:p-6 transition-all shadow-md flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md border ${roleBadgeStyle}`}>
              {roleBadgeText}
            </span>
            <span className="text-sm font-extrabold text-neutral-200">
              {overall_score}% match
            </span>
          </div>

          <div className="flex gap-4 items-start">
            <img
              src={media.cover_image}
              alt={media.title}
              onClick={() => setSelectedMediaDetail(media)}
              className="w-20 h-28 object-cover rounded-xl border border-neutral-800 shadow-md shrink-0 cursor-pointer hover:opacity-90"
            />
            <div className="space-y-1">
              <span className="text-[11px] text-neutral-400 capitalize">{media.type} · {media.runtime_estimate}</span>
              <h3
                onClick={() => setSelectedMediaDetail(media)}
                className="font-bold text-base text-neutral-100 hover:text-amber-400 cursor-pointer transition-colors leading-tight"
              >
                {media.title}
              </h3>
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {media.description}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-300">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">Why this fits:</span>
            <p className="text-[11px] leading-relaxed line-clamp-3">{why_this}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-4 mt-2 border-t border-neutral-800/80">
          <button
            onClick={handleLove}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
              userLoved ? 'text-rose-400 bg-rose-950/40 border border-rose-800/40' : 'text-neutral-300 hover:text-amber-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${userLoved ? 'fill-current' : ''}`} />
            <span>{userLoved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
          >
            <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" />
            <span>&ldquo;No, but...&rdquo;</span>
          </button>
        </div>
      </div>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        mediaTitle={media.title}
      />
    </>
  );
};
