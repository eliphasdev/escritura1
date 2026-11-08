import React, { useState, useEffect, useMemo } from 'react';
import { Volume2, CheckCircle2, Type, Snail, Sparkles } from 'lucide-react';
import { speakSentenceWithSyllables, speakSyllable, stopSpeaking } from '../utils/speechVoice';
import { parseSentenceSyllables, SyllableToken } from '../utils/spanishSyllables';
import { playClick } from '../utils/soundEffects';

interface CursiveLineViewerProps {
  lines: string[];
  activeLineIndex: number;
  completedTimes: { [index: number]: number };
  personalBests: { [index: number]: number | undefined };
  mode: 'notebook' | 'canvas';
  autoReadPhrase?: boolean;
}

export const CursiveLineViewer: React.FC<CursiveLineViewerProps> = ({
  lines,
  activeLineIndex,
  completedTimes,
  personalBests,
  mode,
  autoReadPhrase = true,
}) => {
  const currentLineText = lines[activeLineIndex] || '';
  const [cursiveStyle, setCursiveStyle] = useState<'cl' | 'es' | 'cedar'>('cl');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeSyllable, setActiveSyllable] = useState<SyllableToken | null>(null);

  // Parse words and syllables with memoization
  const parsed = useMemo(() => {
    return parseSentenceSyllables(currentLineText);
  }, [currentLineText]);

  // Read line automatically when active line changes if autoRead is on
  useEffect(() => {
    if (autoReadPhrase && currentLineText) {
      const timer = setTimeout(() => {
        handleListenLine(currentLineText, 0.88);
      }, 400);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
        setActiveSyllable(null);
      };
    }
  }, [activeLineIndex, autoReadPhrase, currentLineText]);

  const handleListenLine = (text: string, rate: number = 0.88) => {
    playClick();
    setIsSpeaking(true);
    setActiveSyllable(null);

    speakSentenceWithSyllables(text, {
      rate: rate,
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

  const formatSeconds = (ms: number) => {
    return (ms / 1000).toFixed(1) + 's';
  };

  const fontClass = cursiveStyle === 'cl' 
    ? 'font-cursive-cl' 
    : cursiveStyle === 'es' 
    ? 'font-cursive-es' 
    : 'font-cursive-cedar';

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Current Active Line - Hero Display with 4-Line School Pauta */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/95 border-2 border-sky-500/40 p-4 sm:p-6 shadow-xl shadow-sky-950/40 overflow-hidden">
        
        {/* Top header bar of the current line card */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs sm:text-sm text-slate-400">
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
            {/* Cursive Font Model Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-950/70 border border-slate-800 rounded-lg p-0.5 text-[11px] font-child">
              <span className="text-slate-400 px-1.5 flex items-center gap-1">
                <Type className="w-3 h-3 text-amber-400" />
                Letra ligada:
              </span>
              <button
                onClick={() => { playClick(); setCursiveStyle('cl'); }}
                className={`px-2 py-0.5 rounded transition-colors ${cursiveStyle === 'cl' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Modelo de Letra Ligada Escolar (Playwrite CL)"
              >
                Escolar CL
              </button>
              <button
                onClick={() => { playClick(); setCursiveStyle('es'); }}
                className={`px-2 py-0.5 rounded transition-colors ${cursiveStyle === 'es' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Modelo de Letra Ligada Tradicional (Playwrite ES)"
              >
                Escolar ES
              </button>
              <button
                onClick={() => { playClick(); setCursiveStyle('cedar'); }}
                className={`px-2 py-0.5 rounded transition-colors ${cursiveStyle === 'cedar' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Manuscrita Cursiva Fluida (Cedarville)"
              >
                Cursiva Fluida
              </button>
            </div>

            {personalBests[activeLineIndex] !== undefined && (
              <span className="text-xs text-amber-300/90 font-timer flex items-center gap-1">
                ⭐ Récord: {formatSeconds(personalBests[activeLineIndex]!)}
              </span>
            )}
          </div>
        </div>

        {/* Big Prominent Speech Reading Bar with Syllable Highlight Notice */}
        <div className="mb-3 p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleListenLine(currentLineText, 0.88)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm ${
                isSpeaking
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 scale-105'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 active:scale-95'
              }`}
              title="Leer frase en voz alta destacando cada sílaba"
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
              <span>{isSpeaking ? 'Leyendo por sílabas...' : 'Leer Frase en Voz Alta'}</span>
            </button>

            <button
              onClick={() => handleListenLine(currentLineText, 0.70)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-200 text-xs font-semibold transition-colors"
              title="Leer más despacio para distinguir cada sílaba con claridad"
            >
              <Snail className="w-3.5 h-3.5 text-amber-300" />
              <span>Leer Despacio (Sílaba a Sílaba)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-child">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Destaca la sílaba al leerla en voz alta</span>
          </div>
        </div>

        {/* 4-Line School Notebook Ruling (Pauta Escolar de Caligrafía) */}
        <div className="relative w-full py-8 px-4 sm:px-8 bg-sky-950/20 rounded-xl border border-sky-800/30 overflow-x-auto">
          
          {/* Subtle Guideline markings with correct school heights */}
          <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none flex flex-col justify-between py-8 px-4 opacity-40">
            {/* Top ascender guideline */}
            <div className="w-full border-b border-dashed border-sky-400/50"></div>
            {/* Middle x-height guideline */}
            <div className="w-full border-b border-sky-300/40"></div>
            {/* Solid baseline */}
            <div className="w-full border-b-2 border-sky-400"></div>
            {/* Bottom descender guideline */}
            <div className="w-full border-b border-dashed border-sky-400/50"></div>
          </div>

          {/* The Actual Connected Cursive Script Display with Real-Time Syllable Highlighting */}
          <div className="relative z-10 py-3 min-h-[110px] flex items-center justify-center sm:justify-start flex-wrap gap-y-2">
            <p className={`${fontClass} text-4xl sm:text-5xl md:text-6xl text-amber-200 select-none drop-shadow-md text-center sm:text-left leading-relaxed flex flex-wrap items-baseline`}>
              {parsed.words.map((wordObj) => (
                <span key={wordObj.wordIndex} className="inline-flex items-baseline mr-4 sm:mr-6 my-1">
                  {wordObj.syllables.map((syl) => {
                    const isHighlighted = activeSyllable?.id === syl.id;
                    return (
                      <span
                        key={syl.id}
                        onClick={() => handleSyllableClick(syl.text)}
                        className={`transition-all duration-150 rounded-lg px-0.5 cursor-pointer relative ${
                          isHighlighted
                            ? 'bg-amber-400 text-slate-950 font-bold scale-110 shadow-lg shadow-amber-400/60 ring-2 ring-amber-300 z-20'
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
          </div>

          {/* Syllable Breakdown Ribbon (Tira Fonética de Sílabas) */}
          <div className="relative z-10 mt-3 pt-3 border-t border-sky-900/50 flex flex-wrap items-center justify-between gap-2 text-xs font-child">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Sílabas:</span>
              </span>
              {parsed.allSyllables.map((syl) => {
                const isHighlighted = activeSyllable?.id === syl.id;
                return (
                  <button
                    key={syl.id}
                    onClick={() => handleSyllableClick(syl.text)}
                    className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
                      isHighlighted
                        ? 'bg-amber-400 text-slate-950 scale-110 shadow-md ring-2 ring-amber-300 font-extrabold'
                        : 'bg-slate-800/80 text-sky-200 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                    title={`Toca para escuchar la sílaba: "${syl.cleanText}"`}
                  >
                    {syl.cleanText}
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] text-slate-400">
              {isSpeaking ? '✨ Destacando sílaba al leer...' : '💡 Toca cualquier sílaba para escuchar su sonido'}
            </span>
          </div>

          {/* Ruling guide legend for kids */}
          <div className="flex items-center justify-between text-[11px] text-sky-400/70 pt-2 border-t border-sky-900/30 mt-2 font-child">
            <span>↑ Letras altas con lazo (l, b, d, t, h)</span>
            <span>═ Línea base de apoyo (letras sentadas)</span>
            <span>↓ Letras bajas con lazo (p, q, g, j, y)</span>
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
                  <span className={`${fontClass} text-xl sm:text-2xl truncate ${isCurrent ? 'text-amber-200' : ''}`}>
                    {line}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-timer text-xs">
                  {/* Speaker button to listen to any line in the road map */}
                  <button
                    onClick={() => handleListenLine(line, 0.88)}
                    className="p-1 rounded text-slate-400 hover:text-amber-300 transition-colors"
                    title={`Leer frase: "${line}"`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

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
