import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { playClick } from '../utils/soundEffects';

interface VoiceAssistantBarProps {
  isListening: boolean;
  isSupported: boolean;
  lastTranscript: string;
  voiceFeedbackEnabled: boolean;
  onToggleListening: () => void;
  onToggleVoiceFeedback: () => void;
}

export const VoiceAssistantBar: React.FC<VoiceAssistantBarProps> = ({
  isListening,
  isSupported,
  lastTranscript,
  voiceFeedbackEnabled,
  onToggleListening,
  onToggleVoiceFeedback,
}) => {
  return (
    <div className="w-full rounded-xl bg-slate-900/80 border border-slate-800 p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
      
      {/* Left zone: Mic status and Voice commands prompt */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button
          onClick={() => {
            playClick();
            onToggleListening();
          }}
          disabled={!isSupported}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
            isListening
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={isListening ? 'Desactivar micrófono' : 'Activar control por voz'}
        >
          {isListening ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>Micrófono Activo</span>
            </>
          ) : (
            <>
              <MicOff className="w-4 h-4 text-slate-500" />
              <span>Voz en Pausa</span>
            </>
          )}
        </button>

        <div className="flex flex-col">
          <span className="font-semibold text-slate-300 font-child">
            {isListening ? 'Escuchando tus órdenes:' : 'Control por voz desactivado'}
          </span>
          <span className="text-[11px] text-slate-400">
            Di: <strong className="text-amber-300">"¡Empezar!"</strong> para el cronómetro o <strong className="text-emerald-300">"¡Listo!"</strong> al terminar la línea
          </span>
        </div>
      </div>

      {/* Middle zone: Last heard phrase transcription */}
      {lastTranscript && isListening && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-950/40 border border-sky-800/40 text-sky-200 max-w-xs truncate animate-fade-in font-child">
          <MessageSquare className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-[11px] truncate">
            Escuché: <em>"{lastTranscript}"</em>
          </span>
        </div>
      )}

      {/* Right zone: Audio voice toggle */}
      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
        <button
          onClick={() => {
            playClick();
            onToggleVoiceFeedback();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
            voiceFeedbackEnabled
              ? 'border-sky-500/30 bg-sky-500/10 text-sky-300'
              : 'border-slate-800 bg-slate-900 text-slate-500'
          }`}
          title="Activar o silenciar respuestas habladas de la app"
        >
          {voiceFeedbackEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voz Asistente ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Voz Asistente OFF</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
