import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, RotateCcw, ArrowRight, Award, Zap } from 'lucide-react';
import { SessionResult } from '../types';
import { playMissionComplete, playClick, playStarChime } from '../utils/soundEffects';
import { speakPhrase } from '../utils/speechVoice';

interface MissionCompleteModalProps {
  session: SessionResult;
  onReplay: () => void;
  onNextMission: () => void;
  onClose: () => void;
}

export const MissionCompleteModal: React.FC<MissionCompleteModalProps> = ({
  session,
  onReplay,
  onNextMission,
  onClose,
}) => {
  useEffect(() => {
    // Play celebratory sound
    playMissionComplete();

    // Voice announcement
    if (session.personalBestsCount > 0) {
      speakPhrase(
        `¡Misión cumplida! ¡Excelente trabajo! Has batido ${session.personalBestsCount} ${
          session.personalBestsCount === 1 ? 'récord personal' : 'récords personales'
        }. ¡Eres un gran astronauta!`,
        true
      );
    } else {
      speakPhrase('¡Misión cumplida! Has completado todas las líneas con hermosa letra ligada.', true);
    }

    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fbbf24', '#34d399', '#f472b6'],
      });
      setTimeout(() => {
        playStarChime(2);
      }, 300);
    } catch {
      // Ignored if canvas-confetti fails
    }
  }, [session]);

  const formatSeconds = (ms: number) => {
    return (ms / 1000).toFixed(1) + 's';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400/40 p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-center animate-scale-up">
        
        {/* Stellar Crown / Trophy Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-400/30 mb-4 animate-bounce">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-child">
          ¡Misión Espacial Cumplida!
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 font-child">
          Completaste <strong className="text-amber-300">{session.lessonTitle}</strong>
        </p>

        {/* Stars Earned */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map(starNum => {
            const hasStar = starNum <= session.starsEarned;
            return (
              <div
                key={starNum}
                className={`p-2 rounded-full transition-all ${
                  hasStar ? 'text-amber-300 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-slate-700'
                }`}
              >
                <Star className="w-8 h-8 fill-current" />
              </div>
            );
          })}
        </div>

        {/* Highlight if Personal Bests beaten */}
        {session.personalBestsCount > 0 && (
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold font-child animate-pulse">
            <Zap className="w-4 h-4 fill-amber-300" />
            <span>¡Batiste {session.personalBestsCount} récord{session.personalBestsCount > 1 ? 's' : ''} personal{session.personalBestsCount > 1 ? 'es' : ''}!</span>
          </div>
        )}

        {/* Lines Breakdown Table */}
        <div className="my-4 rounded-xl bg-slate-950/70 border border-slate-800 p-3 max-h-48 overflow-y-auto text-left">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-child">
            Tiempos por Línea de Escritura
          </div>
          <div className="space-y-1.5">
            {session.lineRecords.map((rec, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/60 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-cursive text-base sm:text-lg text-slate-200 truncate leading-relaxed">
                    {rec.text}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-timer">
                  <span className="text-white font-bold">{formatSeconds(rec.durationMs)}</span>
                  {rec.isNewPersonalBest && (
                    <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/30">
                      ⭐ RÉCORD
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-child">
            <span className="text-slate-400">Tiempo total de la misión:</span>
            <span className="font-timer font-bold text-sky-300 text-sm">
              {formatSeconds(session.totalDurationMs)}
            </span>
          </div>
        </div>

        {/* Rank status */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6 font-child">
          <Award className="w-4 h-4 text-sky-400" />
          <span>Rango actual: <strong className="text-sky-300">{session.rankAchieved}</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              playClick();
              onReplay();
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 font-child"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repetir para Superar Tiempo</span>
          </button>

          <button
            onClick={() => {
              playClick();
              onNextMission();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 font-child"
          >
            <span>Siguiente Misión</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
