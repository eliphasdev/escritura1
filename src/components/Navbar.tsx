import React from 'react';
import { Rocket, Plus } from 'lucide-react';
import { CosmicRank } from '../types';

interface NavbarProps {
  activeTab: 'missions' | 'free-canvas' | 'records' | 'my-texts';
  onSelectTab: (tab: 'missions' | 'free-canvas' | 'records' | 'my-texts') => void;
  onOpenNewTextModal: () => void;
  userRank: CosmicRank;
  totalStars: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewTextModal,
  userRank,
  totalStars
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Single brand wordmark element */}
        <button
          onClick={() => onSelectTab('missions')}
          className="flex items-center gap-2.5 text-left text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-amber-300 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-sky-400 flex items-center justify-center text-slate-950 shadow-md shadow-sky-500/20">
            <Rocket className="w-4 h-4" />
          </div>
          <span className="font-child text-lg sm:text-xl font-extrabold tracking-normal">AstroLetras</span>
        </button>

        {/* Zone 2: 4 single-line navigation links */}
        <nav className="flex items-center gap-1 sm:gap-4 md:gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('missions')}
            className={`px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'missions'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Misiones
          </button>

          <button
            onClick={() => onSelectTab('free-canvas')}
            className={`px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'free-canvas'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pizarra Libre
          </button>

          <button
            onClick={() => onSelectTab('records')}
            className={`px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'records'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Récords Cósmicos
          </button>

          <button
            onClick={() => onSelectTab('my-texts')}
            className={`px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'my-texts'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mis Textos
          </button>
        </nav>

        {/* Zone 3: 1 primary action button + subtle status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-child">
            <span className="text-amber-300 font-semibold flex items-center gap-1">
              ★ {totalStars}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-sky-300">{userRank}</span>
          </div>

          <button
            onClick={onOpenNewTextModal}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 rounded-lg hover:from-amber-300 hover:to-amber-200 transition-all shadow-md shadow-amber-500/20 active:scale-95 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Texto</span>
            <span className="sm:hidden">Crear</span>
          </button>
        </div>

      </div>
    </header>
  );
};
