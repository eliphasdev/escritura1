import React from 'react';
import { Rocket, Star, Check } from 'lucide-react';

interface RocketProgressProps {
  totalLines: number;
  currentLineIndex: number;
  completedLines: number;
}

export const RocketProgress: React.FC<RocketProgressProps> = ({
  totalLines,
  currentLineIndex,
  completedLines,
}) => {
  const percentage = Math.min(100, Math.round((completedLines / totalLines) * 100));

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-child">
        <span className="flex items-center gap-1.5 text-sky-300 font-semibold">
          <Rocket className="w-4 h-4 text-amber-400" />
          Misión Espacial en Curso
        </span>
        <span className="text-amber-300 font-medium font-timer">
          {completedLines} de {totalLines} líneas ({percentage}%)
        </span>
      </div>

      {/* Progress track with rocket and planetary stations */}
      <div className="relative w-full pt-6 pb-2">
        {/* Background track line */}
        <div className="absolute top-10 left-4 right-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${(completedLines / (totalLines - 1 || 1)) * 100}%` }}
          />
        </div>

        {/* Stations */}
        <div className="relative flex items-center justify-between">
          {Array.from({ length: totalLines }).map((_, idx) => {
            const isDone = idx < completedLines;
            const isCurrent = idx === currentLineIndex;

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 group">
                {/* Station Node */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : isCurrent
                      ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20 scale-110 shadow-lg shadow-amber-500/40 animate-bounce'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isCurrent ? (
                    <Rocket className="w-4 h-4 text-slate-950" />
                  ) : (
                    <Star className="w-3.5 h-3.5 opacity-60" />
                  )}
                </div>

                {/* Station Label */}
                <span
                  className={`text-[11px] font-child font-medium transition-colors ${
                    isCurrent
                      ? 'text-amber-300 font-bold'
                      : isDone
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  Línea {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
