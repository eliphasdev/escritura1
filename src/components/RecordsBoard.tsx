import React from 'react';
import { Trophy, Star, Award, Zap, Rocket, Calendar, CheckCircle2 } from 'lucide-react';
import { UserStats, Badge, SessionResult } from '../types';

interface RecordsBoardProps {
  stats: UserStats;
  badges: Badge[];
  recentSessions: SessionResult[];
}

export const RecordsBoard: React.FC<RecordsBoardProps> = ({
  stats,
  badges,
  recentSessions,
}) => {
  const ranksList = [
    { rank: 'Cadete Espacial', minStars: 0, icon: '🚀' },
    { rank: 'Piloto de Órbita', minStars: 4, icon: '🛰️' },
    { rank: 'Astronauta Veloz', minStars: 10, icon: '👨‍🚀' },
    { rank: 'Capitán Estelar', minStars: 20, icon: '⭐' },
    { rank: 'Comandante Galáctico', minStars: 30, icon: '👑' },
  ];

  const formatSeconds = (ms: number) => {
    if (!ms) return '--';
    return (ms / 1000).toFixed(1) + 's';
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-5xl mx-auto py-2">
      
      {/* Hero Rank Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 border border-sky-500/30 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-amber-400/20">
              {stats.rank === 'Comandante Galáctico'
                ? '👑'
                : stats.rank === 'Capitán Estelar'
                ? '⭐'
                : stats.rank === 'Astronauta Veloz'
                ? '👨‍🚀'
                : stats.rank === 'Piloto de Órbita'
                ? '🛰️'
                : '🚀'}
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold font-child">
                Rango Espacial Actual
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-child">
                {stats.rank}
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-child">
                ¡Sigue superando tus tiempos de copiado para ascender en la flota estelar!
              </p>
            </div>
          </div>

          {/* Ranks milestones indicator */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {ranksList.map(r => {
              const isCurrent = stats.rank === r.rank;
              const isPassed = stats.totalStars >= r.minStars;

              return (
                <div
                  key={r.rank}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors font-child ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 font-bold'
                      : isPassed
                      ? 'bg-slate-800 text-sky-300 border border-sky-500/30'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  <span>{r.icon}</span>
                  <span className="hidden sm:inline">{r.rank}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-child">
        
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs text-slate-400 font-medium">Estrellas Cósmicas</span>
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-timer">
            {stats.totalStars}
          </span>
          <span className="text-[11px] text-slate-400">Por velocidad y constancia</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs text-slate-400 font-medium">Récords Batidos</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-timer">
            {stats.totalRecordsBeaten}
          </span>
          <span className="text-[11px] text-slate-400">Superaciones de tu propio tiempo</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs text-slate-400 font-medium">Líneas Copiadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-timer">
            {stats.totalLinesCopied}
          </span>
          <span className="text-[11px] text-slate-400">En letra ligada fluida</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs text-slate-400 font-medium">Línea Más Rápida</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-timer">
            {formatSeconds(stats.fastestLineMs)}
          </span>
          <span className="text-[11px] text-slate-400">Tu mejor marca absoluta</span>
        </div>

      </div>

      {/* Badges Section */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 font-child">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Medallas de Explorador</span>
          </h3>
          <span className="text-xs text-slate-400">
            {badges.filter(b => b.unlocked).length} de {badges.length} desbloqueadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {badges.map(b => (
            <div
              key={b.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                b.unlocked
                  ? 'bg-sky-950/30 border-sky-500/40 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  b.unlocked
                    ? 'bg-gradient-to-tr from-amber-400 to-sky-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-800 text-slate-600'
                }`}
              >
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold truncate text-white">{b.name}</h4>
                  {b.unlocked && (
                    <span className="text-[10px] text-amber-300 font-bold">✓</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{b.description}</p>
                <span className="text-[10px] text-sky-400/80 block mt-1">Meta: {b.condition}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Missions History */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 font-child">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-sky-400" />
          <span>Historial de Prácticas Recientes</span>
        </h3>

        {recentSessions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            <Rocket className="w-8 h-8 mx-auto mb-2 opacity-40 text-sky-400" />
            <p>Aún no has completado misiones espaciales. ¡Comienza hoy!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800 overflow-x-auto">
            {recentSessions.slice(0, 10).map((s, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                    ★ {s.starsEarned}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-white truncate">{s.lessonTitle}</p>
                    <p className="text-[11px] text-slate-400">
                      Modo: {s.mode === 'notebook' ? 'Cuaderno físico' : 'Pizarra digital'} · {s.lineRecords.length} líneas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-timer text-right">
                  {s.personalBestsCount > 0 && (
                    <span className="text-amber-300 font-semibold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      +{s.personalBestsCount} Récords
                    </span>
                  )}
                  <div>
                    <span className="font-bold text-white block">
                      {formatSeconds(s.totalDurationMs)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-child">
                      {new Date(s.timestamp).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
