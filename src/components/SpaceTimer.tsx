import React, { useState, useEffect, useRef } from 'react';
import { Play, Check, Pause, RotateCcw, Rocket, Flame, Trophy } from 'lucide-react';
import { playClick, playStartBeep, playLineFinish, playRecordFanfare } from '../utils/soundEffects';

interface SpaceTimerProps {
  currentLineIndex: number;
  totalLines: number;
  personalBestMs?: number;
  isRunning: boolean;
  onStart: () => void;
  onFinish: (durationMs: number) => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
}

export const SpaceTimer: React.FC<SpaceTimerProps> = ({
  currentLineIndex,
  totalLines,
  personalBestMs,
  isRunning,
  onStart,
  onFinish,
  onPause,
  onResume,
  onRestart,
}) => {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Format mm:ss.cs
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
  };

  // Start / Stop timer loop
  useEffect(() => {
    if (isRunning && !isPaused) {
      startTimeRef.current = Date.now() - elapsedMs;
      timerRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 30);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused, elapsedMs]);

  // Reset timer on line change
  useEffect(() => {
    setElapsedMs(0);
    setIsPaused(false);
  }, [currentLineIndex]);

  const handleStart = () => {
    playStartBeep();
    setElapsedMs(0);
    setIsPaused(false);
    onStart();
  };

  const handleFinish = () => {
    const finalDuration = elapsedMs;
    if (personalBestMs && finalDuration < personalBestMs) {
      playRecordFanfare();
    } else {
      playLineFinish();
    }
    onFinish(finalDuration);
  };

  const handlePauseResume = () => {
    playClick();
    if (isPaused) {
      setIsPaused(false);
      onResume();
    } else {
      setIsPaused(true);
      onPause();
    }
  };

  const handleRestart = () => {
    playClick();
    setElapsedMs(0);
    setIsPaused(false);
    onRestart();
  };

  const isAheadOfRecord = personalBestMs ? elapsedMs < personalBestMs : true;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-4 sm:p-6 shadow-xl flex flex-col items-center gap-4">
      
      {/* Target & Record comparison badge */}
      <div className="w-full flex items-center justify-between text-xs font-child">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Objetivo:</span>
          <span className="text-sky-300 font-semibold">
            Copiar Línea {currentLineIndex + 1} de {totalLines}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {personalBestMs ? (
            <div className="flex items-center gap-1 text-amber-300 font-timer">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Récord a batir: {(personalBestMs / 1000).toFixed(1)}s</span>
            </div>
          ) : (
            <span className="text-slate-400">Primer intento (¡Marca tu récord!)</span>
          )}
        </div>
      </div>

      {/* Main Big Digital Clock with Space Thruster Visual */}
      <div className="relative flex flex-col items-center justify-center py-2">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isRunning && !isPaused ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
            {isRunning && !isPaused ? (
              <Flame className="w-7 h-7 sm:w-8 sm:h-8" />
            ) : (
              <Rocket className="w-7 h-7 sm:w-8 sm:h-8" />
            )}
          </div>

          <div className="flex flex-col items-center">
            <span className="font-timer text-4xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-md">
              {formatTime(elapsedMs)}
            </span>
            <span className="text-[11px] text-slate-400 uppercase tracking-widest font-child">
              {isRunning
                ? isPaused
                  ? '⏸️ Cronómetro en pausa'
                  : '🚀 Cronómetro en marcha'
                : '⏳ Listo para el despegue'}
            </span>
          </div>
        </div>

        {/* Live Superation Indicator */}
        {isRunning && personalBestMs && (
          <div className="mt-2 text-xs font-child">
            {isAheadOfRecord ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ⭐ ¡Vas a tiempo de récord personal!
              </span>
            ) : (
              <span className="text-slate-400">
                ¡Concéntrate en la buena letra! Cada segundo cuenta.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Primary Action Button (Big & Child-Friendly) */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-slate-950 font-bold text-lg sm:text-xl bg-gradient-to-r from-amber-400 via-amber-300 to-sky-400 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-3 font-child"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>Iniciar Línea</span>
            <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded font-mono font-normal">
              o di "Empezar"
            </span>
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-3">
            <button
              onClick={handleFinish}
              className="flex-1 sm:flex-initial px-8 py-4 rounded-xl text-slate-950 font-bold text-lg sm:text-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 font-child"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>¡Línea Lista!</span>
              <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded font-mono font-normal">
                o di "Listo"
              </span>
            </button>

            <button
              onClick={handlePauseResume}
              title={isPaused ? 'Reanudar' : 'Pausar'}
              className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5" />}
            </button>

            <button
              onClick={handleRestart}
              title="Reiniciar esta línea"
              className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
