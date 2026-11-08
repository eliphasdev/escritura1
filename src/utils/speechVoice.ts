/**
 * Web Speech API module: Text-to-Speech (TTS) and Speech-to-Text Recognition
 * With synchronized syllable-by-syllable highlighting for reading and cursive writing practice.
 */
import { parseSentenceSyllables, SyllableToken } from './spanishSyllables';

// Global TTS state
let voiceFeedbackEnabled = true;
let autoReadEnabled = true;

export function setVoiceFeedbackEnabled(enabled: boolean) {
  voiceFeedbackEnabled = enabled;
}

export function isVoiceFeedbackEnabled(): boolean {
  return voiceFeedbackEnabled;
}

export function setAutoReadEnabled(enabled: boolean) {
  autoReadEnabled = enabled;
}

export function isAutoReadEnabled(): boolean {
  return autoReadEnabled;
}

let activeTimers: number[] = [];

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignored
    }
  }
  activeTimers.forEach(t => clearTimeout(t));
  activeTimers = [];
}

/**
 * Finds the best Spanish voice available in the browser
 */
function getSpanishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(v => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Sabina') || v.name.includes('Lucia') || v.name.includes('Mónica') || v.name.includes('Jorge')))
    || voices.find(v => v.lang.startsWith('es-CL') || v.lang.startsWith('es-ES') || v.lang.startsWith('es-419'))
    || voices.find(v => v.lang.startsWith('es'))
    || null
  );
}

/**
 * Standard Text-to-Speech in Spanish
 */
export function speakPhrase(text: string, priority: boolean = true, rate: number = 0.92): void {
  if (!voiceFeedbackEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    if (priority) {
      stopSpeaking();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = rate;
    utterance.pitch = 1.15;

    const voice = getSpanishVoice();
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

/**
 * Speaks a single syllable aloud when clicked by the child
 */
export function speakSyllable(syllableText: string): void {
  const clean = syllableText.replace(/[^\wáéíóúüñ]/gi, '');
  if (!clean) return;
  speakPhrase(clean, true, 0.85);
}

/**
 * Speaks an entire sentence while highlighting each syllable in sync
 */
export function speakSentenceWithSyllables(
  sentence: string,
  options: {
    rate?: number;
    onSyllableChange: (token: SyllableToken | null) => void;
    onEnd?: () => void;
  }
): void {
  if (!voiceFeedbackEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onSyllableChange(null);
    options.onEnd?.();
    return;
  }

  stopSpeaking();

  const { words, allSyllables } = parseSentenceSyllables(sentence);
  if (allSyllables.length === 0) {
    options.onSyllableChange(null);
    options.onEnd?.();
    return;
  }

  const rate = options.rate || 0.88;

  try {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'es-ES';
    utterance.rate = rate;
    utterance.pitch = 1.15;

    const voice = getSpanishVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Base duration per syllable in milliseconds
    // At rate 0.88, a standard syllable takes ~340ms; at rate 0.70 it takes ~440ms
    const baseDuration = (330 / rate);

    let cumulativeTime = 80; // Small initial speech lead-in delay

    allSyllables.forEach((syl, idx) => {
      // Syllable weight factor
      let weight = 1.0;
      if (syl.cleanText.length <= 2) {
        weight = 0.85; // Short syllable (e.g. "mi", "la")
      } else if (syl.cleanText.length >= 4 || /[áéíóú]/.test(syl.cleanText)) {
        weight = 1.2; // Accented or consonant-cluster syllable (e.g. "bril", "nau", "más")
      }

      // If word ends with punctuation, give slightly more pause
      if (syl.text.includes('.') || syl.text.includes(',') || syl.text.includes('!')) {
        weight += 0.45;
      }

      const sylDuration = baseDuration * weight;
      const scheduledTime = cumulativeTime;

      // Highlight this syllable
      const timer = window.setTimeout(() => {
        options.onSyllableChange(syl);
      }, scheduledTime);

      activeTimers.push(timer);
      cumulativeTime += sylDuration;
    });

    // Cleanup timer at the end of phrase
    const endTimer = window.setTimeout(() => {
      options.onSyllableChange(null);
      options.onEnd?.();
    }, cumulativeTime + 100);
    activeTimers.push(endTimer);

    // On speech end event
    utterance.onend = () => {
      // Leave slight buffer before clearing
      setTimeout(() => {
        options.onSyllableChange(null);
        options.onEnd?.();
      }, 150);
    };

    utterance.onerror = () => {
      stopSpeaking();
      options.onSyllableChange(null);
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis with syllables error:', err);
    stopSpeaking();
    options.onSyllableChange(null);
    options.onEnd?.();
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
  onReadPhrase?: () => void;
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

    // Command: Read phrase out loud ("leer", "lee la frase", "qué dice", "escuchar")
    if (
      text.includes('leer') || 
      text.includes('lee') || 
      text.includes('escuchar') || 
      text.includes('qué dice') || 
      text.includes('que dice') ||
      text.includes('dilo')
    ) {
      this.handlers.onReadPhrase?.();
      return;
    }

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
