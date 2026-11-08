import React from 'react';
import { Volume2, CheckCircle2 } from 'lucide-react';
import { speakPhrase } from '../utils/speechVoice';
import { playClick } from '../utils/soundEffects';

interface CursiveLineViewerProps {
  lines: string[];
  activeLineIndex: number;
  completedTimes: { [index: number]: number };
  personalBests: { [index: number]: number | undefined };
  mode: 'notebook' | 'canvas';
}

export const CursiveLineViewer: React.FC<CursiveLineViewerProps> = ({
  lines,
  activeLineIndex,
  completedTimes,
  personalBests,
  mode
}) => {
  const currentLineText = lines[activeLineIndex] || '';

  const handleListenLine = (text: string) => {
    playClick();
    speakPhrase(text, true);
  };

  const formatSeconds = (ms: number) => {
    return (ms / 1000).toFixed(1) + 's';
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Current Active Line - Hero Display with 4-Line School Pauta */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/95 border-2 border-sky-500/40 p-4 sm:p-6 shadow-xl shadow-sky-950/40 overflow-hidden">
        
        {/* Top header bar of the current line card */}
        <div className="flex items-center justify-between gap-2 mb-3 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400 font-child">
              Línea {activeLineIndex + 1} de {lines.length}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300">
              {mode === 'notebook' ? 'Escribe esta línea en tu cuaderno' : 'Traza o copia en la pizarra inferior'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {personalBests[activeLineIndex] !== undefined && (
              <span className="text-xs text-amber-300/90 font-timer flex items-center gap-1">
                ⭐ Récord: {formatSeconds(personalBests[activeLineIndex]!)}
              </span>
            )}
            <button
              onClick={() => handleListenLine(currentLineText)}
              title="Escuchar cómo suena esta frase"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 text-xs font-medium transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Escuchar</span>
            </button>
          </div>
        </div>

        {/* 4-Line School Notebook Ruling (Pauta Escolar de Caligrafía) */}
        <div className="relative w-full py-6 px-4 sm:px-8 bg-sky-950/20 rounded-xl border border-sky-800/30 overflow-x-auto">
          
          {/* Subtle Guideline markings */}
          <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none flex flex-col justify-between py-6 px-4 opacity-40">
            {/* Top ascender guideline */}
            <div className="w-full border-b border-dashed border-sky-400/50"></div>
            {/* Middle x-height guideline */}
            <div className="w-full border-b border-sky-300/40"></div>
            {/* Solid baseline */}
            <div className="w-full border-b-2 border-sky-400"></div>
            {/* Bottom descender guideline */}
            <div className="w-full border-b border-dashed border-sky-400/50"></div>
          </div>

          {/* The Actual Cursive Script Display */}
          <div className="relative z-10 py-2 min-h-[90px] flex items-center justify-center sm:justify-start">
            <p className="font-cursive text-4xl sm:text-5xl md:text-6xl text-amber-200 tracking-wide select-none drop-shadow-md text-center sm:text-left leading-relaxed">
              {currentLineText}
            </p>
          </div>

          {/* Ruling guide legend for kids */}
          <div className="flex items-center justify-between text-[11px] text-sky-400/70 pt-2 border-t border-sky-900/50 mt-2 font-child">
            <span>↑ Letras altas (l, t, b, d)</span>
            <span>═ Línea base de apoyo</span>
            <span>↓ Letras bajas (p, q, g, j)</span>
          </div>
        </div>

      </div>

      {/* Progress of All Lines in this Mission */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 sm:p-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-child">
          Hoja de Ruta de la Misión
        </h4>
        <div className="space-y-2">
          {lines.map((line, idx) => {
            const isCompleted = completedTimes[idx] !== undefined;
            const isCurrent = idx === activeLineIndex;
            const isPending = idx > activeLineIndex;
            const pb = personalBests[idx];

            return (
              <div
                key={idx}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                  isCurrent
                    ? 'bg-sky-950/60 border border-sky-500/50 text-white font-medium'
                    : isCompleted
                    ? 'bg-slate-900/40 text-slate-300'
                    : 'text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  )}
                  <span className={`font-cursive text-lg sm:text-xl truncate ${isCurrent ? 'text-amber-200' : ''}`}>
                    {line}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-timer text-xs">
                  {isCompleted && (
                    <span className="text-emerald-400 font-semibold">
                      {formatSeconds(completedTimes[idx])}
                      {pb && completedTimes[idx] < pb && (
                        <span className="ml-1 text-amber-300 font-bold">¡RÉCORD!</span>
                      )}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-sky-400 animate-pulse font-child font-medium">
                      Escribiendo ahora...
                    </span>
                  )}
                  {isPending && (
                    <span className="text-slate-600 font-child">Pendiente</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
