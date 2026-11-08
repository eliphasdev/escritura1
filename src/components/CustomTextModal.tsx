import React, { useState } from 'react';
import { X, Sparkles, Plus, BookOpen } from 'lucide-react';
import { Lesson } from '../types';
import { playClick } from '../utils/soundEffects';

interface CustomTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLesson: (lesson: Lesson) => void;
}

export const CustomTextModal: React.FC<CustomTextModalProps> = ({
  isOpen,
  onClose,
  onSaveLesson,
}) => {
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Medio' | 'Desafío'>('Fácil');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  if (!isOpen) return null;

  // Split text into lines: either by existing newlines or by smart sentence/comma cuts
  const getProcessedLines = (input: string): string[] => {
    if (!input.trim()) return [];
    
    // If user entered explicit newlines, respect them
    const rawLines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (rawLines.length > 1) {
      return rawLines.slice(0, 6); // Max 6 lines per mission
    }

    // Otherwise split by sentence or commas if long
    const single = input.trim();
    if (single.length <= 35) {
      return [single];
    }

    // Split by punctuation
    const chunks = single.split(/(?<=[.,;?!])\s+/).filter(c => c.length > 0);
    if (chunks.length > 1) {
      return chunks.slice(0, 6);
    }

    // Fallback: chunk by words ~25 chars
    const words = single.split(' ');
    const lines: string[] = [];
    let current = '';

    for (const w of words) {
      if ((current + ' ' + w).trim().length > 30) {
        if (current) lines.push(current.trim());
        current = w;
      } else {
        current = current ? current + ' ' + w : w;
      }
    }
    if (current) lines.push(current.trim());

    return lines.slice(0, 6);
  };

  const previewLines = getProcessedLines(rawText);

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    playClick();

    const spaceIdeas = [
      {
        title: 'El Robot Amigo',
        lines: [
          'el pequeño robot mira las estrellas',
          'su batería se llena con luz solar',
          'saluda a todos los planetas amigos',
          'escribe cartas con tinta plateada'
        ]
      },
      {
        title: 'Aventura en Saturno',
        lines: [
          'los anillos de saturno brillan de oro',
          'nuestra nave espacial da tres vueltas',
          'los cometas saludan al pasar veloces',
          'regresamos contentos a nuestra base'
        ]
      },
      {
        title: 'Mascotas de las Galaxias',
        lines: [
          'un perrito astronauta salta en la luna',
          'lleva un traje blanco muy brillante',
          'ladra alegre al ver la tierra azul',
          'sueña con huesos de polvo estelar'
        ]
      }
    ];

    try {
      // Pick a random creative cosmic theme
      const sample = spaceIdeas[Math.floor(Math.random() * spaceIdeas.length)];
      setTitle(sample.title);
      setRawText(sample.lines.join('\n'));
      setDifficulty('Fácil');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() || previewLines.length === 0) return;
    playClick();

    const newLesson: Lesson = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category: 'Personalizados',
      difficulty: difficulty,
      description: 'Texto personalizado creado para practicar caligrafía ligada.',
      lines: previewLines,
      targetTimePerLineSec: difficulty === 'Fácil' ? 18 : difficulty === 'Medio' ? 22 : 26,
      iconName: 'Sparkles',
      isCustom: true
    };

    onSaveLesson(newLesson);
    setTitle('');
    setRawText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-child">Crear Nuevo Texto a Copiar</h3>
              <p className="text-xs text-slate-400 font-child">Para padres o niños: escribe o genera oraciones para practicar</p>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 py-4">
          
          {/* Quick AI suggestion button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 font-child">¿Buscas inspiración?</span>
            <button
              onClick={handleGenerateAI}
              disabled={isGeneratingAI}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-medium hover:bg-sky-500/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAI ? 'Generando...' : 'Sugerir tema espacial'}</span>
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 font-child">
              Nombre de la Misión
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: El paseo del dinosaurio"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-child"
            />
          </div>

          {/* Difficulty selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 font-child">
              Nivel de dificultad
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Fácil', 'Medio', 'Desafío'] as const).map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => {
                    playClick();
                    setDifficulty(diff);
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold transition-colors font-child ${
                    difficulty === diff
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Raw Text Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 font-child">
              Oraciones o texto a copiar (se divide en líneas automáticamente)
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Escribe cada oración en una línea diferente o pega un texto corto..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-child resize-none"
            />
          </div>

          {/* Cursive Live Preview */}
          {previewLines.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-sky-400 mb-2 font-child font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Vista Previa en Letra Ligada ({previewLines.length} líneas):</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {previewLines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-amber-200">
                    <span className="text-[10px] text-slate-500 font-bold">{idx + 1}.</span>
                    <span className="font-cursive text-xl truncate">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors font-child"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={!title.trim() || previewLines.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md shadow-amber-500/20 font-child"
          >
            Guardar Misión
          </button>
        </div>

      </div>
    </div>
  );
};
