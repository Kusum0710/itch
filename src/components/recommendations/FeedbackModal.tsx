import React, { useState } from 'react';
import { useItch } from '../../context/ItchContext';
import { X, Send, Sparkles, SlidersHorizontal } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaTitle: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  mediaTitle,
}) => {
  const { applyFeedback, setActiveView } = useItch();
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickChips = [
    'No, too serious',
    'Too long / want something shorter',
    'Almost, but give me more comedy',
    'I want something like this but darker',
    'Good story, but pacing is too slow',
    'More brain-off relaxation',
    'Need more intense action',
  ];

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setResultMessage(null);

    const summary = await applyFeedback(text);
    setIsSubmitting(false);
    setResultMessage(summary);

    setTimeout(() => {
      onClose();
      setResultMessage(null);
      setFeedbackText('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Refine your Itch</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-100">
            &ldquo;No, but...&rdquo;
          </h3>
          <p className="text-xs text-neutral-400">
            Tell me what was off about <span className="text-neutral-200 font-semibold">{mediaTitle}</span>, and I will calibrate your sliders and matches immediately.
          </p>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setFeedbackText(chip);
                handleSubmit(chip);
              }}
              disabled={isSubmitting}
              className="text-xs px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 border border-neutral-800 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(feedbackText);
          }}
          className="space-y-4"
        >
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Type your feedback (e.g. 'I like the tone, but I really want something completed that I can finish in an hour')"
            rows={3}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-amber-400 transition-colors"
            disabled={isSubmitting}
          />

          {resultMessage && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300 animate-fadeIn">
              {resultMessage}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveView('sliders');
              }}
              className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Adjust sliders manually
            </button>

            <button
              type="submit"
              disabled={!feedbackText.trim() || isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-all flex items-center gap-2 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Calibrating...' : 'Recalibrate Itch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
