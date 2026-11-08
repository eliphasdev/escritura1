/**
 * Web Speech API module: Text-to-Speech (TTS) and Speech-to-Text Recognition
 */

// Global TTS state
let voiceFeedbackEnabled = true;

export function setVoiceFeedbackEnabled(enabled: boolean) {
  voiceFeedbackEnabled = enabled;
}

export function isVoiceFeedbackEnabled(): boolean {
  return voiceFeedbackEnabled;
}

/**
 * Text-to-Speech in Spanish with friendly child-oriented pitch & rate
 */
export function speakPhrase(text: string, priority: boolean = false): void {
  if (!voiceFeedbackEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    if (priority) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.05; // Slightly lively rate
    utterance.pitch = 1.25; // Cheerful friendly pitch for kids

    // Try finding a good Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es') && !v.name.includes('Google') && v.name.includes('Natural'))
      || voices.find(v => v.lang.startsWith('es'))
      || null;

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

// Speech Recognition Type interfaces for browsers
interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: {
    [index: number]: SpeechRecognitionResultItem;
    isFinal: boolean;
  };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

export type VoiceCommandHandler = {
  onStart?: () => void;
  onFinishLine?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onRestartLine?: () => void;
  onClearCanvas?: () => void;
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  onListeningChange?: (listening: boolean) => void;
};

export class VoiceRecognitionManager {
  private recognition: SpeechRecognitionLike | null = null;
  private isListening = false;
  private handlers: VoiceCommandHandler = {};
  private shouldRestart = false;

  constructor() {
    this.initRecognition();
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  private initRecognition() {
    if (!this.isSupported()) return;

    try {
      const WindowSpeech = (window as unknown as { 
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      });
      const RecognitionConstructor = WindowSpeech.SpeechRecognition || WindowSpeech.webkitSpeechRecognition;

      if (!RecognitionConstructor) return;

      this.recognition = new RecognitionConstructor();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.handlers.onListeningChange?.(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.handlers.onListeningChange?.(false);
        // Automatically restart if user hasn't explicitly stopped it
        if (this.shouldRestart) {
          try {
            this.recognition?.start();
          } catch {
            // Ignore error if already starting
          }
        }
      };

      this.recognition.onerror = (err) => {
        console.warn('Voice recognition notice:', err);
      };

      this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        const normalized = transcript.toLowerCase().trim();
        this.handlers.onTranscript?.(normalized);

        // Analyze voice commands
        this.processCommand(normalized);
      };
    } catch (e) {
      console.warn('Could not initialize Speech Recognition:', e);
    }
  }

  private processCommand(text: string) {
    if (!text) return;

    // Command: Start line
    if (
      text.includes('empezar') || 
      text.includes('iniciar') || 
      text.includes('arrancar') || 
      text.includes('vamos') ||
      text.includes('comenzar') ||
      text.includes('ya')
    ) {
      this.handlers.onStart?.();
      return;
    }

    // Command: Line Finished
    if (
      text.includes('listo') || 
      text.includes('termine') || 
      text.includes('terminé') || 
      text.includes('siguiente') || 
      text.includes('acabe') || 
      text.includes('acabé') || 
      text.includes('completo') ||
      text.includes('linea lista') ||
      text.includes('línea lista')
    ) {
      this.handlers.onFinishLine?.();
      return;
    }

    // Command: Pause
    if (
      text.includes('pausa') || 
      text.includes('pausar') || 
      text.includes('espera') || 
      text.includes('alto')
    ) {
      this.handlers.onPause?.();
      return;
    }

    // Command: Resume
    if (
      text.includes('continuar') || 
      text.includes('seguir') || 
      text.includes('reanudar')
    ) {
      this.handlers.onResume?.();
      return;
    }

    // Command: Restart
    if (
      text.includes('repetir') || 
      text.includes('reiniciar') || 
      text.includes('otra vez') ||
      text.includes('de nuevo')
    ) {
      this.handlers.onRestartLine?.();
      return;
    }

    // Command: Clear canvas
    if (
      text.includes('borrar') || 
      text.includes('limpiar')
    ) {
      this.handlers.onClearCanvas?.();
      return;
    }
  }

  public setHandlers(handlers: VoiceCommandHandler) {
    this.handlers = handlers;
  }

  public start() {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) return;

    this.shouldRestart = true;
    try {
      this.recognition.start();
    } catch {
      // Already running or permission prompt pending
    }
  }

  public stop() {
    this.shouldRestart = false;
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch {
      // Ignored
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const voiceManager = new VoiceRecognitionManager();
