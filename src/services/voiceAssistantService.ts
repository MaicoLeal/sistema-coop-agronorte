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

export const ES_LATAM_LOCALES = [
  'es-419',
  'es-us',
  'es-mx',
  'es-py',
  'es-ar',
  'es-co',
  'es-cl',
  'es-uy',
  'es-pe',
  'es-ec',
  'es-cr',
  'es-pa',
  'es-bo',
  'es-gt',
  'es-hn',
  'es-sv',
  'es-ni',
  'es-do',
  'es-ve'
];

export const ES_MALE_KEYWORDS = [
  'mateo',
  'alonso',
  'carlos',
  'jorge',
  'gonzalo',
  'alvaro',
  'álvaro',
  'diego',
  'raul',
  'raúl',
  'miguel',
  'enrique',
  'pablo',
  'manuel',
  'javier',
  'julio',
  'mario',
  'emilio',
  'andres',
  'andrés',
  'tomas',
  'tomás',
  'federico',
  'ignacio',
  'rodrigo',
  'fernando',
  'es-us-x-sfg', // Google Android LatAm male voice
  'es-es-x-eed', // Google Android male voice
  'es-419',
  'latino',
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
   * Returns currently cached or loaded voices synchronously
   */
  public static getLoadedVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return this.cachedVoices;
    }
    const current = window.speechSynthesis.getVoices();
    if (current && current.length > 0) {
      this.cachedVoices = current;
      return current;
    }
    return this.cachedVoices;
  }

  /**
   * Asynchronously waits for voiceschanged event (critical for Android where voices load late)
   */
  public static waitForVoices(timeoutMs = 800): Promise<SpeechSynthesisVoice[]> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return Promise.resolve([]);
    }

    const immediate = window.speechSynthesis.getVoices();
    if (immediate && immediate.length > 0) {
      this.cachedVoices = immediate;
      return Promise.resolve(immediate);
    }

    if (this.cachedVoices.length > 0) {
      return Promise.resolve(this.cachedVoices);
    }

    return new Promise((resolve) => {
      let settled = false;

      const finish = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
          const finalVoices = window.speechSynthesis.getVoices();
          if (finalVoices && finalVoices.length > 0) {
            this.cachedVoices = finalVoices;
          }
          resolve(this.cachedVoices.length > 0 ? this.cachedVoices : finalVoices);
        }
      };

      const timer = setTimeout(finish, timeoutMs);

      const onVoicesChanged = () => {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          finish();
        }
      };

      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
    });
  }

  /**
   * Evaluates available voices and selects the best natural male voice for Don Mateo,
   * giving top priority to Latin American Spanish (es-419), Natural, Google, and Microsoft voices.
   */
  public static selectMaleVoice(
    lang: 'pt-BR' | 'es-PY' | 'es-ES' | 'es-419' | Language | string,
    candidateVoices?: SpeechSynthesisVoice[]
  ): VoiceSelectionResult {
    let voices: SpeechSynthesisVoice[] = [];
    if (candidateVoices && candidateVoices.length > 0) {
      voices = candidateVoices;
    } else {
      voices = this.getLoadedVoices();
    }

    if (voices.length === 0) {
      return { voice: null, isExplicitMale: false, isFemaleFallback: false };
    }

    const isPortuguese = typeof lang === 'string' && (lang === 'pt-BR' || lang.startsWith('pt'));

    const isFemaleName = (name: string) => {
      const lower = name.toLowerCase();
      // If voice has explicit male indicator (like 'male', 'hombre', 'latino', 'es-us-x-sfg', 'es-419'),
      // do not flag it as female just because it starts with generic "Google español"
      const hasExplicitMaleToken =
        ES_MALE_KEYWORDS.some((kw) => lower.includes(kw)) ||
        PT_MALE_KEYWORDS.some((kw) => lower.includes(kw));

      if (hasExplicitMaleToken) {
        const strictFemaleKeywords = [
          'female', 'mulher', 'mujer', 'femenina', 'feminina', 'femenino', 'feminino',
          'maria', 'mary', 'helena', 'elena', 'sabina', 'laura', 'luciana', 'francisca',
          'thalita', 'talita', 'leticia', 'letícia', 'camila', 'vitoria', 'vitória',
          'monica', 'mónica', 'paulina', 'victoria', 'zira', 'carmen', 'conchita',
          'ines', 'inês', 'rosa', 'raquel', 'mia', 'sofia', 'jimena', 'dalia',
          'pt-br-x-afy', 'es-es-x-ana', 'es-us-x-sfb', 'es-es-x-sfb'
        ];
        return strictFemaleKeywords.some((kw) => lower.includes(kw));
      }

      return FEMALE_VOICE_KEYWORDS.some((kw) => lower.includes(kw));
    };

    const isLatam = (voiceLang: string) => {
      const vl = voiceLang.toLowerCase().replace('_', '-');
      return ES_LATAM_LOCALES.some((loc) => vl.startsWith(loc));
    };

    // Filter out all known female voices first
    const nonFemaleVoices = voices.filter((v) => !isFemaleName(v.name));

    // Scoring function to prioritize Latin American Spanish (es-419), Google, Natural & Microsoft male voices
    const scoreVoice = (v: SpeechSynthesisVoice): { score: number; isExplicitMale: boolean } => {
      let score = 0;
      let isExplicitMale = false;
      const name = v.name.toLowerCase();
      const vl = v.lang.toLowerCase().replace('_', '-');

      if (isPortuguese) {
        if (vl.startsWith('pt')) {
          score += 120;
          if (vl.includes('br')) score += 30;
        } else if (vl.startsWith('es')) {
          score += 40; // bilingual fallback
        }

        if (PT_MALE_KEYWORDS.some((kw) => name.includes(kw))) {
          score += 100;
          isExplicitMale = true;
        } else if (ES_MALE_KEYWORDS.some((kw) => name.includes(kw))) {
          score += 60;
          isExplicitMale = true;
        }

        if (name.includes('natural')) score += 45;
        if (name.includes('google')) score += 35;
        if (name.includes('microsoft')) score += 25;
      } else {
        // Spanish: Highest priority for es-419, then Latin American locales, then Google/Natural/Microsoft
        if (vl === 'es-419' || vl.startsWith('es-419')) {
          score += 200; // Decisive top priority for es-419 as requested
        } else if (isLatam(vl)) {
          score += 120; // Latin American locales (es-us, es-mx, es-py, etc.)
        } else if (vl.startsWith('es')) {
          score += 60; // Other Spanish (e.g. es-es)
        } else if (vl.startsWith('pt')) {
          score += 30; // Bilingual fallback
        }

        // Extra bonus for explicit es-419 or latino indicator in name
        if (name.includes('es-419') || name.includes('latino') || name.includes('419')) {
          score += 40;
        }

        // Male name keywords (Mateo, Alonso, Carlos, Jorge, Raul, etc.)
        if (ES_MALE_KEYWORDS.some((kw) => name.includes(kw))) {
          score += 100;
          isExplicitMale = true;
        } else if (PT_MALE_KEYWORDS.some((kw) => name.includes(kw))) {
          score += 50;
          isExplicitMale = true;
        }

        // Provider preferences requested by user: Google / Natural / Microsoft
        if (name.includes('natural')) score += 50;
        if (name.includes('google') || name.includes('es-us-x-sfg') || name.includes('es-419')) score += 45;
        if (name.includes('microsoft')) score += 35;
      }

      return { score, isExplicitMale };
    };

    if (nonFemaleVoices.length > 0) {
      const scored = nonFemaleVoices.map((v) => {
        const { score, isExplicitMale } = scoreVoice(v);
        return { voice: v, score, isExplicitMale };
      });

      scored.sort((a, b) => b.score - a.score);

      const best = scored[0];
      if (best && best.score > 0) {
        return {
          voice: best.voice,
          isExplicitMale: best.isExplicitMale,
          isFemaleFallback: false
        };
      }
    }

    // Last Fallback: If literally only female/unverified voices exist on client device
    const fallbackVoice =
      voices.find((v) => (isPortuguese ? v.lang.toLowerCase().startsWith('pt') : v.lang.toLowerCase().startsWith('es'))) ||
      voices[0] ||
      null;

    return {
      voice: fallbackVoice,
      isExplicitMale: false,
      isFemaleFallback: true
    };
  }

  /**
   * Selects the best human-like male voice available in the client's browser
   */
  public static getBestMaleVoice(
    lang: 'pt-BR' | 'es-PY' | 'es-ES' | 'es-419' | Language | string,
    candidateVoices?: SpeechSynthesisVoice[]
  ): SpeechSynthesisVoice | null {
    return this.selectMaleVoice(lang, candidateVoices).voice;
  }

  /**
   * Speaks the provided text using a human-like warm male tone.
   * Prioritizes es-419 for Latin American Spanish, lower pitch (0.82) and lower speed (0.88)
   * to eliminate robotic cadence, and waits for voiceschanged on Android where voices load asynchronously.
   */
  public static speak(
    text: string,
    lang: Language | 'es-419' | 'pt-BR' | 'es-PY' | string,
    onStart?: () => void,
    onEnd?: () => void
  ): { stop: () => void } {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Síntese de voz não suportada neste navegador.');
      return { stop: () => {} };
    }

    this.init();
    this.stop();

    let cancelled = false;

    // Use es-419 as preferred language code for Spanish recommendations
    const isPortuguese = typeof lang === 'string' && (lang === 'pt-BR' || lang.startsWith('pt'));
    const targetLang = isPortuguese ? 'pt-BR' : 'es-419';

    const playUtterance = (voices: SpeechSynthesisVoice[]) => {
      if (cancelled) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;

      const selection = this.selectMaleVoice(targetLang, voices);
      if (selection.voice) {
        utterance.voice = selection.voice;
      }

      // Organic acoustic tuning for Don Mateo:
      // Lower pitch (0.82) and lower speed (0.88) removes robotic artifacts and creates a warm, natural agricultural advisor voice
      if (selection.isFemaleFallback) {
        utterance.pitch = 0.65;
        utterance.rate = 0.85;
      } else if (selection.isExplicitMale) {
        utterance.pitch = 0.82;
        utterance.rate = 0.88;
      } else {
        utterance.pitch = 0.76;
        utterance.rate = 0.88;
      }

      utterance.onstart = () => {
        if (!cancelled && onStart) onStart();
      };

      utterance.onend = () => {
        this.activeUtterance = null;
        if (!cancelled && onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('Erro na reprodução de voz:', e);
        this.activeUtterance = null;
        if (!cancelled && onEnd) onEnd();
      };

      this.activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    };

    // Check if voices are loaded; if empty (typical on Android), wait for voiceschanged before speaking
    const loaded = this.getLoadedVoices();
    if (loaded.length > 0) {
      playUtterance(loaded);
    } else {
      this.waitForVoices(800).then((voices) => {
        playUtterance(voices);
      });
    }

    return {
      stop: () => {
        cancelled = true;
        this.stop(onEnd);
      }
    };
  }

  /**
   * Promise-based speech synthesis variant
   */
  public static async speakAsync(
    text: string,
    lang: Language | 'es-419' | 'pt-BR' | 'es-PY' | string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      const handleEnd = () => {
        if (onEnd) onEnd();
        resolve();
      };
      this.speak(text, lang, onStart, handleEnd);
    });
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
