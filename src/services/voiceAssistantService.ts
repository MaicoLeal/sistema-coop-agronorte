import { Language } from '../types';
import { findAgronomicAnswer } from '../data/agronomicKnowledgeBase';

export interface VoiceAssistantResponse {
  answerText: string;
  speakText: string;
  actionType?: 'open_harvest' | 'open_pest_diagnosis' | 'show_greenhouses' | 'none';
}

export class VoiceAssistantService {
  private static activeUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Selects the best human-like male voice available in the client's browser
   */
  public static getBestMaleVoice(lang: 'pt-BR' | 'es-PY' | 'es-ES'): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null;
    }

    const voices = window.speechSynthesis.getVoices();
    const isPortuguese = lang.startsWith('pt');

    // Priority list for natural male voices in Portuguese
    const ptMaleKeywords = [
      'antonio',
      'fábio',
      'fabio',
      'ricardo',
      'daniel',
      'felipe',
      'pt-br-x-afy', // Google Chrome Android male voice
      'pt-br-x-afs',
      'male',
      'homem',
      'natural'
    ];

    // Priority list for natural male voices in Spanish (Paraguay / Latin America)
    const esMaleKeywords = [
      'jorge',
      'gonzalo',
      'alvaro',
      'diego',
      'carlos',
      'mateo',
      'miguel',
      'es-es-x-eed',
      'es-us-x-sfg',
      'male',
      'hombre',
      'natural'
    ];

    const keywords = isPortuguese ? ptMaleKeywords : esMaleKeywords;
    const targetLangCode = isPortuguese ? 'pt' : 'es';

    // 1. First priority: Male name match + matching language
    for (const kw of keywords) {
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(targetLangCode) &&
          v.name.toLowerCase().includes(kw)
      );
      if (match) return match;
    }

    // 2. Second priority: Any voice matching target language that does not explicitly say female/mulher/mujer
    const nonFemaleMatch = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith(targetLangCode) &&
        !v.name.toLowerCase().includes('female') &&
        !v.name.toLowerCase().includes('mulher') &&
        !v.name.toLowerCase().includes('mujer') &&
        !v.name.toLowerCase().includes('luciana') &&
        !v.name.toLowerCase().includes('maria') &&
        !v.name.toLowerCase().includes('mónica') &&
        !v.name.toLowerCase().includes('monica') &&
        !v.name.toLowerCase().includes('helena') &&
        !v.name.toLowerCase().includes('paulina') &&
        !v.name.toLowerCase().includes('victoria')
    );
    if (nonFemaleMatch) return nonFemaleMatch;

    // 3. Fallback: Any voice in the target language
    return voices.find((v) => v.lang.toLowerCase().startsWith(targetLangCode)) || null;
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

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = lang === 'pt-BR' ? 'pt-BR' : 'es-PY';
    utterance.lang = targetLang;

    // Male acoustic tuning:
    // pitch ~0.88-0.92 gives a deeper, warmer, reassuring masculine resonance
    // rate ~0.93-0.96 provides relaxed, deliberate agricultural pacing
    utterance.pitch = 0.90;
    utterance.rate = 0.94;

    const maleVoice = this.getBestMaleVoice(targetLang);
    if (maleVoice) {
      utterance.voice = maleVoice;
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
