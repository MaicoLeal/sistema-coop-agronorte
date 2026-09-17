import { Language } from '../types';
import { findAgronomicAnswer } from '../data/agronomicKnowledgeBase';

export interface VoiceAssistantResponse {
  answerText: string;
  speakText: string;
  actionType?: 'open_harvest' | 'open_pest_diagnosis' | 'show_greenhouses' | 'none';
}

export const FEMALE_VOICE_KEYWORDS = [
  'female',
  'mulher',
  'mujer',
  'femenina',
  'feminina',
  'femenino',
  'feminino',
  'woman',
  'girl',
  'maria',
  'mary',
  'helena',
  'elena',
  'sabina',
  'laura',
  'luciana',
  'francisca',
  'thalita',
  'talita',
  'leticia',
  'letícia',
  'camila',
  'vitoria',
  'vitória',
  'monica',
  'mónica',
  'paulina',
  'victoria',
  'zira',
  'carmen',
  'conchita',
  'ines',
  'inês',
  'rosa',
  'raquel',
  'mia',
  'sofia',
  'jimena',
  'dalia',
  'paloma',
  'alba',
  'elvira',
  'teresa',
  'brenda',
  'yara',
  'valentina',
  'lupe',
  'marta',
  'manuela',
  'catalina',
  'soledad',
  'lucia',
  'lúcia',
  'juana',
  'esmeralda',
  'guadalupe',
  'rebeca',
  'silvia',
  'clara',
  'ana',
  'amalia',
  'fernanda',
  'gabriela',
  'joana',
  'marcia',
  'márcia',
  'priscila',
  'renata',
  'tatiana',
  'claudia',
  'cláudia',
  'patricia',
  'patrícia',
  'beatriz',
  'adriana',
  // Google TTS Android female voices
  'pt-br-x-afy',
  'es-es-x-ana',
  'es-us-x-sfb',
  'es-es-x-sfb',
  // Default Chrome female voices
  'google português do brasil',
  'google português',
  'google español',
  'google espanol'
];

export const PT_MALE_KEYWORDS = [
  'antonio',
  'antônio',
  'fábio',
  'fabio',
  'daniel',
  'ricardo',
  'felipe',
  'alvaro',
  'álvaro',
  'carlos',
  'julio',
  'júlio',
  'duarte',
  'pt-br-x-afs',
  'pt-br-x-ptd',
  'male',
  'homem',
  'masculin',
  'natural male'
];

export const ES_MALE_KEYWORDS = [
  'mateo',
  'jorge',
  'gonzalo',
  'alvaro',
  'álvaro',
  'diego',
  'carlos',
  'miguel',
  'raul',
  'raúl',
  'enrique',
  'pablo',
  'manuel',
  'javier',
  'julio',
  'alonso',
  'es-es-x-eed',
  'es-us-x-sfg',
  'male',
  'hombre',
  'masculin',
  'varón',
  'natural male'
];

export interface VoiceSelectionResult {
  voice: SpeechSynthesisVoice | null;
  isExplicitMale: boolean;
  isFemaleFallback: boolean;
}

export class VoiceAssistantService {
  private static activeUtterance: SpeechSynthesisUtterance | null = null;
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static initialized = false;

  /**
   * Initializes voice pre-loading and watches for system voice changes
   */
  public static init(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.initialized) return;
    this.initialized = true;

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          this.cachedVoices = voices;
        }
      } catch (e) {
        // ignore
      }
    };

    loadVoices();
    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Evaluates available voices and selects the best natural male voice for Don Mateo
   */
  public static selectMaleVoice(
    lang: 'pt-BR' | 'es-PY' | 'es-ES',
    candidateVoices?: SpeechSynthesisVoice[]
  ): VoiceSelectionResult {
    let voices: SpeechSynthesisVoice[] = [];
    if (candidateVoices && candidateVoices.length > 0) {
      voices = candidateVoices;
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      voices = window.speechSynthesis.getVoices();
      if (voices.length === 0 && this.cachedVoices.length > 0) {
        voices = this.cachedVoices;
      }
    }

    if (voices.length === 0) {
      return { voice: null, isExplicitMale: false, isFemaleFallback: false };
    }

    const isPortuguese = lang.startsWith('pt');
    const targetLangCode = isPortuguese ? 'pt' : 'es';
    const altLangCode = isPortuguese ? 'es' : 'pt';
    const primaryKeywords = isPortuguese ? PT_MALE_KEYWORDS : ES_MALE_KEYWORDS;
    const secondaryKeywords = isPortuguese ? ES_MALE_KEYWORDS : PT_MALE_KEYWORDS;

    const isFemaleName = (name: string) => {
      const lower = name.toLowerCase();
      return FEMALE_VOICE_KEYWORDS.some((kw) => lower.includes(kw));
    };

    // 1. First priority: Target language + explicit target male name
    for (const kw of primaryKeywords) {
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(targetLangCode) &&
          !isFemaleName(v.name) &&
          v.name.toLowerCase().includes(kw)
      );
      if (match) {
        return { voice: match, isExplicitMale: true, isFemaleFallback: false };
      }
    }

    // 2. Second priority: Target language + any male keyword
    for (const kw of [...primaryKeywords, ...secondaryKeywords]) {
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(targetLangCode) &&
          !isFemaleName(v.name) &&
          v.name.toLowerCase().includes(kw)
      );
      if (match) {
        return { voice: match, isExplicitMale: true, isFemaleFallback: false };
      }
    }

    // 3. Third priority: Sibling language explicit male voice (e.g. Spanish male voice for Don Mateo if PT only has female voices)
    for (const kw of secondaryKeywords) {
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(altLangCode) &&
          !isFemaleName(v.name) &&
          v.name.toLowerCase().includes(kw)
      );
      if (match) {
        return { voice: match, isExplicitMale: true, isFemaleFallback: false };
      }
    }

    // 4. Fourth priority: Target language voice that is NOT in the female blacklist
    const safeTargetVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith(targetLangCode) && !isFemaleName(v.name)
    );
    if (safeTargetVoice) {
      return { voice: safeTargetVoice, isExplicitMale: false, isFemaleFallback: false };
    }

    // 5. Fifth priority: Sibling language voice that is NOT in the female blacklist
    const safeAltVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith(altLangCode) && !isFemaleName(v.name)
    );
    if (safeAltVoice) {
      return { voice: safeAltVoice, isExplicitMale: false, isFemaleFallback: false };
    }

    // 6. Last Fallback: Best available voice in target language (or any), flagged as female fallback
    const fallbackVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith(targetLangCode)) ||
      voices[0] ||
      null;

    return { voice: fallbackVoice, isExplicitMale: false, isFemaleFallback: true };
  }

  /**
   * Selects the best human-like male voice available in the client's browser
   */
  public static getBestMaleVoice(
    lang: 'pt-BR' | 'es-PY' | 'es-ES',
    candidateVoices?: SpeechSynthesisVoice[]
  ): SpeechSynthesisVoice | null {
    return this.selectMaleVoice(lang, candidateVoices).voice;
  }

  /**
   * Speaks the provided text using a human-like warm male tone
   */
  public static speak(
    text: string,
    lang: Language,
    onStart?: () => void,
    onEnd?: () => void
  ): { stop: () => void } {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Síntese de voz não suportada neste navegador.');
      return { stop: () => {} };
    }

    this.init();
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = lang === 'pt-BR' ? 'pt-BR' : 'es-PY';
    utterance.lang = targetLang;

    const selection = this.selectMaleVoice(targetLang);
    if (selection.voice) {
      utterance.voice = selection.voice;
    }

    // Acoustic tuning for Don Mateo:
    if (selection.isFemaleFallback) {
      // Baritone pitch-shift (0.68) lowers the fundamental formant frequency
      // transforming standard female/neutral voices into a warm masculine timbre
      utterance.pitch = 0.68;
      utterance.rate = 0.90;
    } else if (selection.isExplicitMale) {
      // Natural male voice: deep, reassuring, warm agricultural tone
      utterance.pitch = 0.85;
      utterance.rate = 0.94;
    } else {
      // Neutral non-female voice: mild pitch lowering to ensure masculine resonance
      utterance.pitch = 0.78;
      utterance.rate = 0.92;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Erro na reprodução de voz:', e);
      this.activeUtterance = null;
      if (onEnd) onEnd();
    };

    this.activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);

    return {
      stop: () => this.stop(onEnd)
    };
  }

  /**
   * Stops any currently playing speech
   */
  public static stop(onEnd?: () => void): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
      if (onEnd) onEnd();
    }
  }

  /**
   * Checks if browser speech synthesis is currently active
   */
  public static isSpeaking(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }
    return window.speechSynthesis.speaking;
  }

  /**
   * Speech Recognition (Speech-to-text / Hands-free)
   */
  public static createSpeechRecognition(
    lang: Language,
    onResult: (transcript: string) => void,
    onError?: (err: any) => void,
    onEnd?: () => void
  ): { start: () => void; stop: () => void; isSupported: boolean } {
    if (typeof window === 'undefined') {
      return { start: () => {}, stop: () => {}, isSupported: false };
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return { start: () => {}, stop: () => {}, isSupported: false };
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'pt-BR' ? 'pt-BR' : 'es-PY';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (e: any) => {
      console.warn('Erro no reconhecimento de voz:', e);
      if (onError) onError(e);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    return {
      start: () => {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Reconhecimento já iniciado ou erro:', e);
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
      },
      isSupported: true
    };
  }

  /**
   * Don Mateo's fast knowledge engine for farmers (Q&A)
   */
  public static answerFarmerQuery(
    query: string,
    lang: Language,
    context?: {
      greenhouse1Status?: string;
      greenhouse2Status?: string;
      activeBatchCode?: string;
    }
  ): VoiceAssistantResponse {
    return findAgronomicAnswer(query, lang, context);
  }
}
