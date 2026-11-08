import React, { useState } from 'react';
import { Rocket, Sparkles, BookOpen, Clock, Play, Trash2 } from 'lucide-react';
import { Lesson } from '../types';
import { playClick } from '../utils/soundEffects';

interface MissionsListProps {
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson, mode: 'notebook' | 'canvas') => void;
  onDeleteCustomLesson: (id: string) => void;
  personalBests: Record<string, number>;
}

export const MissionsList: React.FC<MissionsListProps> = ({
  lessons,
  onSelectLesson,
  onDeleteCustomLesson,
  personalBests,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todas las Misiones' },
    { id: 'Primeros Trazos', label: 'Primeros Trazos' },
    { id: 'Aventura Espacial', label: 'Aventura Espacial' },
    { id: 'Mundo Animal', label: 'Mundo Animal' },
    { id: 'Cuentos y Retos', label: 'Cuentos y Retos' },
    { id: 'Personalizados', label: 'Creados por Mí' },
  ];

  const filtered = lessons.filter(l => {
    if (selectedCategory !== 'all' && l.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && l.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const getLessonBestTime = (lesson: Lesson): number | null => {
    let sum = 0;
    let hasAll = true;
    for (let i = 0; i < lesson.lines.length; i++) {
      const pb = personalBests[`${lesson.id}_${i}`];
      if (pb !== undefined) {
        sum += pb;
      } else {
        hasAll = false;
      }
    }
    return hasAll ? sum : null;
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto py-2">
      
      {/* Category Tabs (Interactive Segmented Filter Buttons) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              playClick();
              setSelectedCategory(cat.id);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors font-child whitespace-nowrap shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(lesson => {
          const totalBest = getLessonBestTime(lesson);

          return (
            <div
              key={lesson.id}
              className="relative rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between hover:border-sky-500/40 transition-all shadow-md group"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-child">
                  <span>{lesson.category}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-semibold ${
                      lesson.difficulty === 'Fácil'
                        ? 'text-emerald-400'
                        : lesson.difficulty === 'Medio'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {lesson.difficulty}
                  </span>

                  {lesson.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playClick();
                        onDeleteCustomLesson(lesson.id);
                      }}
                      className="ml-auto text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Eliminar texto personalizado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-white font-child group-hover:text-amber-300 transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-child">
                  {lesson.description}
                </p>

                {/* Cursive Sample Line */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block font-child mb-1">
                    Muestra de letra ligada:
                  </span>
                  <p className="font-cursive text-xl text-amber-200 truncate select-none">
                    {lesson.lines[0]}
                  </p>
                </div>

                {/* Line count & personal best */}
                <div className="flex items-center justify-between text-xs text-slate-400 mt-3 font-child">
                  <span>{lesson.lines.length} líneas de copiado</span>
                  {totalBest ? (
                    <span className="text-amber-300 font-timer flex items-center gap-1 font-semibold">
                      ⭐ Récord: {(totalBest / 1000).toFixed(1)}s
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">Sin récord aún</span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Choose Notebook vs Digital Canvas */}
              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    playClick();
                    onSelectLesson(lesson, 'notebook');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors font-child"
                  title="Escribes en tu cuaderno real con la app como cronómetro y asistente de voz"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>En Cuaderno</span>
                </button>

                <button
                  onClick={() => {
                    playClick();
                    onSelectLesson(lesson, 'canvas');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:brightness-110 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-amber-400/20 font-child active:scale-95"
                  title="Escribes o calcas con lápiz en la pantalla digital"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>En Pantalla</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
