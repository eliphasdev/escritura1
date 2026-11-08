import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Check, Pause, RotateCcw, Rocket, Flame, Trophy, Volume2 } from 'lucide-react';
import { playClick, playStartBeep, playLineFinish, playRecordFanfare } from '../utils/soundEffects';
import { speakSentenceWithSyllables, stopSpeaking } from '../utils/speechVoice';
import { parseSentenceSyllables, SyllableToken } from '../utils/spanishSyllables';

interface SpaceTimerProps {
  currentLineIndex: number;
  totalLines: number;
  currentLineText: string;
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
  currentLineText,
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
  const [activeSyllable, setActiveSyllable] = useState<SyllableToken | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Parse words and syllables
  const parsed = useMemo(() => {
    return parseSentenceSyllables(currentLineText);
  }, [currentLineText]);

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
    setActiveSyllable(null);
    setIsSpeaking(false);
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

  const handleListen = () => {
    playClick();
    setIsSpeaking(true);
    setActiveSyllable(null);

    speakSentenceWithSyllables(currentLineText, {
      rate: 0.88,
      onSyllableChange: (token) => {
        setActiveSyllable(token);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setActiveSyllable(null);
      },
    });
  };

  const isAheadOfRecord = personalBestMs ? elapsedMs < personalBestMs : true;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      
      {/* Target & Record comparison badge */}
      <div className="w-full flex items-center justify-between text-xs font-child">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Objetivo:</span>
          <span className="text-sky-300 font-semibold">
            Línea {currentLineIndex + 1} de {totalLines}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {personalBestMs ? (
            <div className="flex items-center gap-1 text-amber-300 font-timer">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Récord: {(personalBestMs / 1000).toFixed(1)}s</span>
            </div>
          ) : (
            <span className="text-slate-400">Primer intento (¡Marca tu récord!)</span>
          )}
        </div>
      </div>

      {/* TEXT TO COPY - ALWAYS VISIBLE BANNER INSIDE CRONOMETRO WITH SYLLABLE HIGHLIGHT */}
      <div className="w-full rounded-xl bg-slate-950 border-2 border-amber-400/50 p-3.5 flex flex-col gap-1.5 shadow-inner">
        <div className="flex items-center justify-between text-xs font-child">
          <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <span>✏️ Texto que estamos copiando:</span>
          </span>
          <button
            onClick={handleListen}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              isSpeaking
                ? 'bg-amber-400 text-slate-950 font-bold scale-105'
                : 'bg-slate-800 hover:bg-slate-700 text-sky-300'
            }`}
            title="Escuchar esta frase con iluminación por sílabas"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce' : ''}`} />
            <span>{isSpeaking ? 'Leyendo...' : 'Escuchar'}</span>
          </button>
        </div>

        {/* Big cursive text with real-time syllable highlight */}
        <p className="font-cursive text-2xl sm:text-3xl text-amber-200 select-none leading-relaxed py-1 flex flex-wrap items-baseline gap-y-1">
          {parsed.words.map((wordObj) => (
            <span key={wordObj.wordIndex} className="inline-flex items-baseline mr-3 sm:mr-4">
              {wordObj.syllables.map((syl) => {
                const isHighlighted = activeSyllable?.id === syl.id;
                return (
                  <span
                    key={syl.id}
                    className={`transition-all duration-150 rounded-md px-0.5 ${
                      isHighlighted
                        ? 'bg-amber-400 text-slate-950 font-bold scale-110 shadow-md ring-2 ring-amber-300'
                        : ''
                    }`}
                  >
                    {syl.text}
                  </span>
                );
              })}
            </span>
          ))}
        </p>

        {isSpeaking && (
          <span className="text-[10px] text-amber-400 font-child flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            Destacando cada sílaba al ritmo de la voz
          </span>
        )}
      </div>

      {/* Main Big Digital Clock with Space Thruster Visual */}
      <div className="relative flex flex-col items-center justify-center py-1">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isRunning && !isPaused ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
            {isRunning && !isPaused ? (
              <Flame className="w-7 h-7 sm:w-8 sm:h-8" />
            ) : (
              <Rocket className="w-7 h-7 sm:w-8 sm:h-8" />
            )}
          </div>

          <div className="flex flex-col items-center">
            <span className="font-timer text-4xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-md">
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
          <div className="mt-1 text-xs font-child">
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

      {/* Action Buttons: START OR STOP WITH THE PHRASE TEXT VISIBLE ON THE BUTTON */}
      <div className="w-full flex flex-col items-center justify-center gap-2 pt-1">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="w-full p-4 rounded-2xl text-slate-950 font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-sky-400 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 font-child group text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center shrink-0">
                <Play className="w-6 h-6 fill-slate-950" />
              </div>
              <div className="min-w-0 flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-extrabold uppercase tracking-tight">
                    Iniciar Cronómetro
                  </span>
                  <span className="text-[10px] bg-slate-950/20 px-2 py-0.5 rounded font-mono font-normal">
                    o di "Empezar"
                  </span>
                </div>
                <span className="text-xs text-slate-800 font-medium">
                  Copiando ahora: <strong className="font-cursive text-sm text-slate-950">{currentLineText}</strong>
                </span>
              </div>
            </div>

            <span className="text-xs font-extrabold bg-slate-950 text-amber-300 px-3 py-1.5 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
              ¡Despegar! 🚀
            </span>
          </button>
        ) : (
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={handleFinish}
              className="w-full p-4 rounded-2xl text-slate-950 font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 font-child group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div className="min-w-0 flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-extrabold uppercase tracking-tight">
                      ¡Detener! Línea Terminada
                    </span>
                    <span className="text-[10px] bg-slate-950/20 px-2 py-0.5 rounded font-mono font-normal">
                      o di "Listo"
                    </span>
                  </div>
                  <span className="text-xs text-slate-800 font-medium">
                    Terminé de copiar: <strong className="font-cursive text-sm text-slate-950">{currentLineText}</strong>
                  </span>
                </div>
              </div>

              <span className="text-xs font-extrabold bg-slate-950 text-emerald-300 px-3 py-1.5 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                Guardar Tiempo ⏱️
              </span>
            </button>

            {/* Secondary controls: Pause and Restart */}
            <div className="flex items-center justify-center gap-2 pt-1 text-xs">
              <button
                onClick={handlePauseResume}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-child"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
              </button>

              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-child"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar tiempo</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
