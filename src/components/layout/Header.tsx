import React from 'react';
import { useItch, AppView } from '../../context/ItchContext';
import { Compass, Sliders, Sparkles, BookOpen, Clock, User, Settings as SettingsIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeView, setActiveView, library } = useItch();

  const totalSaved = library.saved.length + library.finished.length;

  const navItems: { view: AppView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { view: 'home', label: 'Home', icon: <Sparkles className="w-4 h-4" /> },
    { view: 'discovery', label: 'Discover', icon: <Compass className="w-4 h-4" /> },
    { view: 'sliders', label: 'Fine-Tune', icon: <Sliders className="w-4 h-4" /> },
    { view: 'explore', label: 'Explore', icon: <Compass className="w-4 h-4" /> },
    { view: 'library', label: 'Library', icon: <BookOpen className="w-4 h-4" />, badge: totalSaved > 0 ? totalSaved : undefined },
    { view: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
    { view: 'profile', label: 'Taste', icon: <User className="w-4 h-4" /> },
    { view: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo & tagline */}
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <span className="font-black text-neutral-950 text-xl tracking-tighter">i</span>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-neutral-100 flex items-center gap-1.5">
              Itch
              <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-400">beta</span>
            </span>
            <p className="text-[11px] text-neutral-400 hidden sm:block">Find what you crave</p>
          </div>
        </button>

        {/* Clean nav typography - Zero pills, clean underline / text state */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`relative py-1 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive ? 'text-amber-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {item.label}
                {item.badge !== undefined && (
                  <span className="text-[10px] text-neutral-400 font-normal">({item.badge})</span>
                )}
                {isActive && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action button: Find my itch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('discovery')}
            className="px-4 py-2 text-sm font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-100 border border-neutral-700/80 rounded-xl transition-all hover:border-amber-500/40 hover:shadow-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Start an Itch</span>
            <span className="sm:hidden">Itch</span>
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-neutral-900 bg-neutral-950 no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-lg transition-colors ${
                isActive ? 'text-amber-400 bg-neutral-900' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
