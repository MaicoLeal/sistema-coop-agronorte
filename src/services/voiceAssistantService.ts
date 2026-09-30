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
  // Explicit female voice names only. Do not block generic Google Spanish/Portuguese
  // voices here because Android often exposes high-quality voices with generic names.
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
  'hector',
  'héctor',
  'david',
  'antonio',
  'pedro',
  'luis',
  'sergio',
  'alberto',
  'santiago',
  'sebastian',
  'sebastián',
  'jose',
  'josé',
  'juan',
  'es-us-x-sfg', // Google Android LatAm male voice
  'es-es-x-eed', // Google Android male voice
  'es-419',
  'latino',
  'male',
  'hombre',
  'masculin',
  'varón',
  'varon',
  'natural male'
];

export interface StudioAudioClip {
  id: string;
  url: string;
  transcriptEs: string;
  keywords: string[];
}

export const STUDIO_AUDIO_REGISTRY: StudioAudioClip[] = [
  {
    id: 'greeting_es',
    url: '/assets/don-mateo/don-mateo-greeting-es.mp3',
    transcriptEs:
      'Hola, amigo productor. Soy Don Mateo, tu asistente técnico de la Coop Agronorte. Estoy cuidando tus invernaderos y listo para ayudarte. ¿Qué te gustaría consultar o hacer hoy?',
    keywords: [
      'hola amigo productor soy don mateo tu asistente tecnico de la coop agronorte',
      'hola amigo productor soy don mateo tu asistente tecnico'
    ]
  }
];

export interface VoiceSelectionResult {
  voice: SpeechSynthesisVoice | null;
  isExplicitMale: boolean;
  isFemaleFallback: boolean;
}

export class VoiceAssistantService {
  private static activeUtterance: SpeechSynthesisUtterance | null = null;
  private static activeAudioElement: HTMLAudioElement | null = null;
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
   * giving top priority to Latin American Spanish (es-PY, es-419, es-MX, es-US), Natural, Google, and Microsoft voices.
   * GUARANTEE: Never switches to a Portuguese voice when Spanish is requested.
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

    const isSpanishVoice = (v: SpeechSynthesisVoice): boolean => {
      const vl = (v.lang || '').toLowerCase().replace('_', '-');
      const name = (v.name || '').toLowerCase();
      return (
        vl.startsWith('es') ||
        vl.includes('-es') ||
        vl.includes('_es') ||
        name.includes('español') ||
        name.includes('spanish') ||
        name.includes('castellano')
      );
    };

    const isPortugueseVoice = (v: SpeechSynthesisVoice): boolean => {
      const vl = (v.lang || '').toLowerCase().replace('_', '-');
      const name = (v.name || '').toLowerCase();
      return (
        vl.startsWith('pt') ||
        vl.includes('-pt') ||
        vl.includes('_pt') ||
        name.includes('português') ||
        name.includes('portugues') ||
        name.includes('portuguese')
      );
    };

    // Filter strictly by target language family so we never cross-contaminate languages
    const targetVoices = voices.filter(isPortuguese ? isPortugueseVoice : isSpanishVoice);

    // If no voice matches the target language, do NOT cross language boundaries!
    if (targetVoices.length === 0) {
      return { voice: null, isExplicitMale: false, isFemaleFallback: false };
    }

    const isExplicitMale = (name: string, isPt: boolean): boolean => {
      const lower = name.toLowerCase();
      if (isPt) {
        return PT_MALE_KEYWORDS.some((kw) => lower.includes(kw));
      }
      return ES_MALE_KEYWORDS.some((kw) => lower.includes(kw));
    };

    const isFemaleName = (name: string, isPt: boolean): boolean => {
      if (isExplicitMale(name, isPt)) return false;
      const lower = name.toLowerCase();
      return FEMALE_VOICE_KEYWORDS.some((kw) => lower.includes(kw));
    };

    const isLatam = (voiceLang: string) => {
      const vl = voiceLang.toLowerCase().replace('_', '-');
      return ES_LATAM_LOCALES.some((loc) => vl.startsWith(loc));
    };

    // Scoring function
    const scoreVoice = (v: SpeechSynthesisVoice): { score: number; explicitMale: boolean; female: boolean } => {
      let score = 100; // Base score for correct language
      const name = v.name.toLowerCase();
      const vl = (v.lang || '').toLowerCase().replace('_', '-');
      const explicitMale = isExplicitMale(name, isPortuguese);
      const female = isFemaleName(name, isPortuguese);

      if (isPortuguese) {
        if (vl.includes('br')) score += 50; // Prioritize Brazilian Portuguese
        if (explicitMale) score += 120;
        else if (!female) score += 50; // Neutral voice
        // Provider bonus
        if (name.includes('natural') || name.includes('neural')) score += 50;
        if (name.includes('google') || name.includes('pt-br-x-afs')) score += 40;
        if (name.includes('microsoft')) score += 30;
      } else {
        // Spanish
        const reqLower = typeof lang === 'string' ? lang.toLowerCase().replace('_', '-') : '';

        // Exact match with requested language (e.g. es-py or es-419)
        if (reqLower && vl === reqLower) {
          score += 200;
        }

        // Locale priority: Paraguay > LatAm > Peninsular
        if (vl === 'es-py' || vl.startsWith('es-py')) {
          score += 250; // Paraguay Cooperativa Agronorte priority
        } else if (vl === 'es-419' || vl.startsWith('es-419')) {
          score += 180;
        } else if (isLatam(vl)) {
          score += 150; // Other Latin American (es-mx, es-us, es-ar, es-co, etc.)
        } else if (vl.startsWith('es')) {
          score += 60; // Spain (es-es)
        }

        // Bonus for explicit latino/es-419 in voice name
        if (name.includes('es-419') || name.includes('latino') || name.includes('419')) {
          score += 40;
        }

        // Gender priority: male > neutral > female fallback
        if (explicitMale) {
          score += 150;
        } else if (!female) {
          score += 70; // Neutral voice like "Google español"
        }

        // Provider quality bonus
        if (name.includes('natural') || name.includes('neural')) score += 50;
        if (name.includes('google') || name.includes('es-us-x-sfg') || name.includes('es-es-x-eed')) score += 40;
        if (name.includes('microsoft')) score += 30;
      }

      return { score, explicitMale, female };
    };

    // Score all voices in target language
    const scored = targetVoices.map((v) => {
      const { score, explicitMale, female } = scoreVoice(v);
      return { voice: v, score, explicitMale, female };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // 1. First choice: Best non-female voice (male or neutral)
    const maleOrNeutral = scored.filter((item) => !item.female);
    if (maleOrNeutral.length > 0 && maleOrNeutral[0].score > 0) {
      return {
        voice: maleOrNeutral[0].voice,
        isExplicitMale: maleOrNeutral[0].explicitMale,
        isFemaleFallback: false
      };
    }

    // 2. Fallback: If only female voices exist for this language on the user's OS,
    // use the highest scoring female voice in the CORRECT language with baritone modulation!
    const bestFallback = scored[0];
    return {
      voice: bestFallback ? bestFallback.voice : null,
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
   * Plays a pre-recorded high-fidelity ElevenLabs studio audio clip using HTML5 Audio
   */
  public static playStudioAudio(
    url: string,
    onStart?: () => void,
    onEnd?: () => void
  ): { stop: () => void } {
    if (typeof window === 'undefined') {
      return { stop: () => {} };
    }

    this.stop();

    try {
      const audio = new Audio(url);
      this.activeAudioElement = audio;

      let ended = false;
      const finish = () => {
        if (!ended) {
          ended = true;
          if (this.activeAudioElement === audio) {
            this.activeAudioElement = null;
          }
          if (onEnd) onEnd();
        }
      };

      audio.onplay = () => {
        if (onStart) onStart();
      };

      audio.onended = finish;
      audio.onerror = (e) => {
        console.warn('Erro ao reproduzir áudio studio do ElevenLabs:', e);
        finish();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Reprodução do áudio studio bloqueada ou falhou:', err);
          finish();
        });
      }

      return {
        stop: () => {
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch (e) {
            // ignore
          }
          finish();
        }
      };
    } catch (e) {
      console.warn('Falha ao instanciar elemento de áudio studio:', e);
      if (onEnd) onEnd();
      return { stop: () => {} };
    }
  }

  /**
   * Matches input text strictly against pre-recorded studio ElevenLabs clips.
   * Prevents matching partial words or generic phrases, ensuring regular questions
   * and conversational answers are synthesized dynamically without repeating the greeting.
   */
  public static findMatchingStudioClip(text: string): StudioAudioClip | null {
    if (!text || typeof text !== 'string') return null;

    const normalizedInput = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!normalizedInput) return null;

    for (const clip of STUDIO_AUDIO_REGISTRY) {
      const normTranscript = clip.transcriptEs
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // 1. Exact match with transcript
      if (normalizedInput === normTranscript) {
        return clip;
      }

      // 2. Strict full greeting: Must be long, start with greeting and contain key phrases
      if (
        normalizedInput.length >= 75 &&
        normalizedInput.startsWith('hola amigo productor') &&
        normalizedInput.includes('coop agronorte') &&
        normalizedInput.includes('cuidando tus invernaderos')
      ) {
        return clip;
      }

      // 3. Exact match with registered full phrase keywords
      const matchesKeyword = clip.keywords.some((kw) => {
        const normKw = kw
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return normKw.length > 25 && normalizedInput === normKw;
      });

      if (matchesKeyword) {
        return clip;
      }
    }

    return null;
  }

  /**
   * Speaks the provided text using a human-like warm male tone.
   * Plays pre-recorded studio ElevenLabs clips when available, or synthesizes using
   * Paraguayan/Latin American Spanish with lower pitch to eliminate robotic cadence.
   */
  public static speak(
    text: string,
    lang: Language | 'es-419' | 'pt-BR' | 'es-PY' | string,
    onStart?: () => void,
    onEnd?: () => void
  ): { stop: () => void } {
    const isPortuguese = typeof lang === 'string' && (lang === 'pt-BR' || lang.startsWith('pt'));

    // 1. Check if there is a studio-quality ElevenLabs recording strictly registered for this phrase
    if (!isPortuguese && typeof window !== 'undefined') {
      const matchedClip = this.findMatchingStudioClip(text);

      if (matchedClip) {
        console.info(`[Don Mateo Studio Audio] Reproduzindo áudio ElevenLabs: ${matchedClip.id}`);
        return this.playStudioAudio(matchedClip.url, onStart, onEnd);
      }
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Síntese de voz não suportada neste navegador.');
      return { stop: () => {} };
    }

    this.init();
    this.stop();

    let cancelled = false;

    const playUtterance = (voices: SpeechSynthesisVoice[]) => {
      if (cancelled) return;

      const utterance = new SpeechSynthesisUtterance(text);

      const selection = this.selectMaleVoice(lang, voices);
      if (selection.voice) {
        utterance.voice = selection.voice;
        utterance.lang = selection.voice.lang;
        console.info(
          `Don Mateo TTS usando voz: ${selection.voice.name} (${selection.voice.lang})`,
          selection.isExplicitMale ? 'masculina_detectada' : selection.isFemaleFallback ? 'fallback_feminino_baritono' : 'voz_neutra'
        );
      } else {
        // Universal BCP-47 locale recognized by all major browser TTS engines
        utterance.lang = isPortuguese ? 'pt-BR' : 'es-ES';
        console.info(`Don Mateo TTS usando síntese padrão do navegador para idioma: ${utterance.lang}`);
      }

      // Organic acoustic tuning for Don Mateo:
      // Lower pitch (0.78-0.84) and lower speed (0.88) removes robotic artifacts and creates a warm, natural agricultural advisor voice
      if (selection.isFemaleFallback) {
        utterance.pitch = 0.78; // Warm baritone transposition
        utterance.rate = 0.88;
      } else if (selection.isExplicitMale) {
        utterance.pitch = 0.84;
        utterance.rate = 0.88;
      } else {
        utterance.pitch = 0.80;
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

    // Check if voices are loaded; if empty or missing voices in target language, wait for voiceschanged
    const loaded = this.getLoadedVoices();
    const prefix = isPortuguese ? 'pt' : 'es';
    const hasTargetVoice = loaded.some((v) => {
      const vl = (v.lang || '').toLowerCase().replace('_', '-');
      const name = (v.name || '').toLowerCase();
      return vl.startsWith(prefix) || (prefix === 'es' && (name.includes('español') || name.includes('spanish')));
    });

    if (loaded.length > 0 && hasTargetVoice) {
      playUtterance(loaded);
    } else {
      this.waitForVoices(1000).then((voices) => {
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
   * Stops any currently playing speech or studio audio
   */
  public static stop(onEnd?: () => void): void {
    if (this.activeAudioElement) {
      try {
        this.activeAudioElement.pause();
        this.activeAudioElement.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this.activeAudioElement = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    }

    if (onEnd) onEnd();
  }

  /**
   * Checks if audio or speech synthesis is currently active
   */
  public static isSpeaking(): boolean {
    const isAudioPlaying = Boolean(this.activeAudioElement && !this.activeAudioElement.paused);
    const isSynthSpeaking =
      typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
    return isAudioPlaying || isSynthSpeaking;
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
