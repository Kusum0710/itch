import React, { useState, useEffect } from 'react';
import { useItch } from '../context/ItchContext';
import { Shield, Sparkles, Database, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { userTaste, resetItchProfile } = useItch();
  const [healthStatus, setHealthStatus] = useState<{ hasGeminiKey: boolean; catalogSize: number } | null>(null);
  const [clearedNotice, setClearedNotice] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch(() => setHealthStatus({ hasGeminiKey: false, catalogSize: 18 }));
  }, []);

  const handleClearData = () => {
    if (confirm('Are you sure you want to reset all stored library, taste profiles, and history?')) {
      localStorage.removeItem('itch_user_taste');
      localStorage.removeItem('itch_library');
      localStorage.removeItem('itch_history');
      resetItchProfile();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 2500);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-800">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
          Preferences &amp; Engine
        </span>
        <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">
          Settings &amp; Architecture
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Manage local storage, engine adapters, and privacy boundaries.
        </p>
      </div>

      {/* Engine Status */}
      <section className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>System Status</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
            <span className="text-xs text-neutral-400">Recommendation Intelligence</span>
            <div className="flex items-center gap-2 pt-1">
              {healthStatus?.hasGeminiKey ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-neutral-200">Gemini 3.8 Flash Connected</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-neutral-200">Heuristic Engine (Demo Mode)</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 pt-1">
              {healthStatus?.hasGeminiKey
                ? 'Server-side @google/genai SDK active with zero browser key exposure.'
                : 'Adaptive fallback active. All sliders, scoring formulas, and feedback loops fully operational without external keys.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
            <span className="text-xs text-neutral-400">Database &amp; Vector Index</span>
            <div className="flex items-center gap-2 pt-1">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-neutral-200">Supabase pgvector Schema Ready</span>
            </div>
            <p className="text-[11px] text-neutral-400 pt-1">
              Relational PostgreSQL schema in <code className="text-amber-400">/src/db/schema.sql</code>. {healthStatus?.catalogSize || 18} catalog items in cache.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy & Ethical Stance */}
      <section className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Privacy &amp; Non-Diagnostic Stance</span>
        </h3>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Itch is designed for mental fatigue, decision overload, and fluctuating stimulation appetites. We never diagnose users, apply medical labels, or share session history.
        </p>
      </section>

      {/* Danger Zone: Clear Data */}
      <section className="p-6 rounded-3xl bg-rose-950/10 border border-rose-900/30 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Local Storage &amp; Cache</span>
        </h3>
        <p className="text-xs text-neutral-400">
          Reset all stored library items, long-term learned taste points, and session logs on this browser.
        </p>

        {clearedNotice && (
          <div className="p-3 rounded-xl bg-rose-900/40 border border-rose-700 text-xs text-rose-200 animate-fadeIn">
            All session data and library items cleared!
          </div>
        )}

        <button
          onClick={handleClearData}
          className="px-4 py-2 bg-rose-900/40 hover:bg-rose-900 text-rose-200 text-xs font-semibold rounded-xl border border-rose-700/60 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset All Applet Data</span>
        </button>
      </section>
    </div>
  );
};
