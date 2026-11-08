import React, { useState } from 'react';
import { HandwritingCanvas } from './HandwritingCanvas';
import { Volume2, Sparkles } from 'lucide-react';
import { speakPhrase } from '../utils/speechVoice';
import { playClick } from '../utils/soundEffects';

export const FreeCanvasView: React.FC = () => {
  const [customWord, setCustomWord] = useState('mi nave vuela alto');

  const sampleWords = [
    'mi nave vuela alto',
    'hola estrella hermosa',
    'aprendo letra ligada',
    'astronauta veloz',
    'la luna brilla blanca'
  ];

  const handleListen = () => {
    playClick();
    speakPhrase(customWord, true);
  };

  return (
    <div className="w-full flex flex-col gap-5 max-w-4xl mx-auto py-2">
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white font-child flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Pizarra Libre de Caligrafía</span>
            </h2>
            <p className="text-xs text-slate-400 font-child">
              Escribe cualquier palabra o frase para verla en letra ligada y practicarla a tu ritmo.
            </p>
          </div>

          <button
            onClick={handleListen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-xs font-semibold transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>Escuchar Pronunciación</span>
          </button>
        </div>

        {/* Input for custom word */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
          <input
            type="text"
            value={customWord}
            onChange={(e) => setCustomWord(e.target.value)}
            placeholder="Escribe lo que quieras practicar..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400 font-child"
          />
        </div>

        {/* Quick word suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5 text-xs font-child">
          <span className="text-slate-500">Ideas:</span>
          {sampleWords.map(w => (
            <button
              key={w}
              onClick={() => {
                playClick();
                setCustomWord(w);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {w}
            </button>
          ))}
        </div>

        {/* Cursive text model banner */}
        <div className="rounded-xl bg-sky-950/30 border border-sky-800/40 p-4 mb-5 text-center sm:text-left">
          <span className="text-[10px] text-sky-400 uppercase tracking-wider block font-child mb-1 font-semibold">
            Modelo en Letra Ligada Escolar
          </span>
          <p className="font-cursive text-4xl sm:text-5xl text-amber-200 select-none py-1 truncate">
            {customWord || 'Escribe una palabra arriba...'}
          </p>
        </div>

        {/* Interactive Drawing Canvas */}
        <HandwritingCanvas guideText={customWord} />
      </div>
    </div>
  );
};
