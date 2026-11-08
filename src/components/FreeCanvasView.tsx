import React, { useState, useMemo } from 'react';
import { HandwritingCanvas } from './HandwritingCanvas';
import { Volume2, Sparkles, Type } from 'lucide-react';
import { speakSentenceWithSyllables, speakSyllable } from '../utils/speechVoice';
import { parseSentenceSyllables, SyllableToken } from '../utils/spanishSyllables';
import { playClick } from '../utils/soundEffects';

export const FreeCanvasView: React.FC = () => {
  const [customWord, setCustomWord] = useState('Mi nave vuela alto.');
  const [cursiveStyle, setCursiveStyle] = useState<'cl' | 'es' | 'cedar'>('cl');
  const [activeSyllable, setActiveSyllable] = useState<SyllableToken | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const sampleWords = [
    'Mi nave vuela alto.',
    'Hola, estrella hermosa.',
    'Aprendo letra ligada.',
    'El astronauta es veloz.',
    'La Luna brilla blanca.',
    'Los gatos saltan alegres.',
    'Leo y Sofía viajan al espacio.'
  ];

  const parsed = useMemo(() => {
    return parseSentenceSyllables(customWord);
  }, [customWord]);

  const handleListen = () => {
    playClick();
    setIsSpeaking(true);
    setActiveSyllable(null);

    speakSentenceWithSyllables(customWord, {
      rate: 0.85,
      onSyllableChange: (token) => {
        setActiveSyllable(token);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setActiveSyllable(null);
      },
    });
  };

  const handleSyllableClick = (syllableText: string) => {
    playClick();
    speakSyllable(syllableText);
  };

  const fontClass = cursiveStyle === 'cl' 
    ? 'font-cursive-cl' 
    : cursiveStyle === 'es' 
    ? 'font-cursive-es' 
    : 'font-cursive-cedar';

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
              Escribe cualquier palabra o frase para verla en auténtica letra ligada continua y practicarla a tu ritmo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleListen}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSpeaking
                  ? 'bg-amber-400 text-slate-950 font-bold scale-105 ring-2 ring-amber-300'
                  : 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
              <span>{isSpeaking ? 'Leyendo por sílabas...' : 'Escuchar Pronunciación'}</span>
            </button>
          </div>
        </div>

        {/* Input for custom word */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
          <input
            type="text"
            value={customWord}
            onChange={(e) => setCustomWord(e.target.value)}
            placeholder="Escribe lo que quieras practicar..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400 font-child"
          />
        </div>

        {/* Cursive Font Model Picker */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs font-child">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Type className="w-4 h-4 text-amber-400" />
            <span>Modelo de letra ligada:</span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => { playClick(); setCursiveStyle('cl'); }}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  cursiveStyle === 'cl' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Escolar CL
              </button>
              <button
                onClick={() => { playClick(); setCursiveStyle('es'); }}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  cursiveStyle === 'es' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Escolar ES
              </button>
              <button
                onClick={() => { playClick(); setCursiveStyle('cedar'); }}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  cursiveStyle === 'cedar' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cursiva Fluida
              </button>
            </div>
          </div>

          {/* Quick word suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-child">
            <span className="text-slate-500">Ideas:</span>
            {sampleWords.map(w => (
              <button
                key={w}
                onClick={() => {
                  playClick();
                  setCustomWord(w);
                }}
                className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Cursive text model banner with real-time syllable highlighting */}
        <div className="rounded-xl bg-sky-950/30 border border-sky-800/40 p-4 mb-4 text-center sm:text-left">
          <span className="text-[10px] text-sky-400 uppercase tracking-wider block font-child mb-1 font-semibold">
            Modelo en Letra Ligada Continua (con Sílabas Guiadas)
          </span>
          <p className={`${fontClass} text-4xl sm:text-5xl text-amber-200 select-none py-2 leading-relaxed flex flex-wrap items-baseline gap-y-1`}>
            {parsed.words.map((wordObj) => (
              <span key={wordObj.wordIndex} className="inline-flex items-baseline mr-4 sm:mr-5">
                {wordObj.syllables.map((syl) => {
                  const isHighlighted = activeSyllable?.id === syl.id;
                  return (
                    <span
                      key={syl.id}
                      onClick={() => handleSyllableClick(syl.text)}
                      className={`transition-all duration-150 rounded-lg px-0.5 cursor-pointer ${
                        isHighlighted
                          ? 'bg-amber-400 text-slate-950 font-bold scale-110 shadow-lg shadow-amber-400/50 ring-2 ring-amber-300'
                          : 'hover:text-white'
                      }`}
                      title="Toca para escuchar solo esta sílaba"
                    >
                      {syl.text}
                    </span>
                  );
                })}
              </span>
            ))}
          </p>

          {/* Syllables ribbon */}
          <div className="mt-3 pt-2.5 border-t border-sky-900/40 flex flex-wrap items-center gap-1.5 text-xs font-child">
            <span className="text-slate-400 text-[11px] font-semibold">Sílabas:</span>
            {parsed.allSyllables.map((syl) => {
              const isHighlighted = activeSyllable?.id === syl.id;
              return (
                <button
                  key={syl.id}
                  onClick={() => handleSyllableClick(syl.text)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                    isHighlighted
                      ? 'bg-amber-400 text-slate-950 scale-110 ring-2 ring-amber-300'
                      : 'bg-slate-800 text-sky-200 hover:bg-slate-700'
                  }`}
                >
                  {syl.cleanText}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Drawing Canvas */}
        <HandwritingCanvas guideText={customWord} />
      </div>
    </div>
  );
};
