import { Language } from '../types';

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
    const q = query.toLowerCase();
    const isPt = lang === 'pt-BR';

    // 1. Greenhouse & Water / Nutrients Status
    if (
      q.includes('estufa') ||
      q.includes('água') ||
      q.includes('agua') ||
      q.includes('adubo') ||
      q.includes('nutriente') ||
      q.includes('ph') ||
      q.includes('ec') ||
      q.includes('calor') ||
      q.includes('invernadero')
    ) {
      if (isPt) {
        return {
          answerText:
            'A Estufa 1 (Tomate) está com água e adubo excelentes, pH em 6.1 e condutividade em 2.1 mS/cm. Na Estufa 2 (Locote), o ar está um pouco quente e seco (VPD em 1.4 kPa). Recomendo abrir um pouco as cortinas laterais para circular o ar.',
          speakText:
            'Olá amigo! Analisei suas estufas agora. A Estufa 1 de Tomate está com a água e o adubo perfeitos! Já a Estufa 2 de Locote está um pouco quente e com ar seco. É bom abrir as cortinas laterais para renovar o ar.',
          actionType: 'show_greenhouses'
        };
      } else {
        return {
          answerText:
            'El Invernadero 1 (Tomate) está excelente: pH en 6.1 y conductividad ideal en 2.1 mS/cm. En el Invernadero 2 (Locote), el ambiente está algo caluroso y seco. Te sugiero abrir un poco las cortinas laterales para ventilar.',
          speakText:
            '¡Buen día amigo! Revisé los invernaderos. El Invernadero 1 de Tomate tiene el agua y los nutrientes en punto perfecto. En el Invernadero 2 de Locote hace algo de calor y el aire está seco. Conviene abrir las cortinas laterales para que corra aire.',
          actionType: 'show_greenhouses'
        };
      }
    }

    // 2. Harvest & Packing
    if (
      q.includes('colheita') ||
      q.includes('cosecha') ||
      q.includes('caixa') ||
      q.includes('caja') ||
      q.includes('registrar') ||
      q.includes('embalar')
    ) {
      if (isPt) {
        return {
          answerText:
            'Para registrar a colheita, você só precisa selecionar a estufa e informar quantas caixas foram colhidas hoje. Pode clicar no botão verde "Registrar Colheita" que eu te guio passo a passo!',
          speakText:
            'Registrar a colheita é muito simples! Basta escolher a estufa e me dizer quantas caixas foram colhidas. Se quiser, clique agora no botão verde de Registrar Colheita que te ajudo!',
          actionType: 'open_harvest'
        };
      } else {
        return {
          answerText:
            'Para registrar tu cosecha, sólo selecciona el invernadero e indica cuántas cajas cosechaste hoy. ¡Haz clic en el botón verde "Registrar Cosecha" y te guío con gusto!',
          speakText:
            '¡Es muy fácil registrar la cosecha! Sólo elige el invernadero y cuántas cajas sacaste hoy. Puedes hacer clic en el botón verde de Registrar Cosecha y lo hacemos juntos.',
          actionType: 'open_harvest'
        };
      }
    }

    // 3. Pest, Fungi or Yellow Leaf
    if (
      q.includes('praga') ||
      q.includes('doença') ||
      q.includes('enfermedad') ||
      q.includes('folha') ||
      q.includes('hoja') ||
      q.includes('amarela') ||
      q.includes('amarilla') ||
      q.includes('mancha') ||
      q.includes('bicho') ||
      q.includes('lagarta') ||
      q.includes('fungo') ||
      q.includes('hongo')
    ) {
      if (isPt) {
        return {
          answerText:
            'Folhas com manchas ou amareladas podem ser sinal de oídio, míldio ou falta de circulação de ar. O ideal é você tirar uma foto com o botão "Tirar Foto com IA" para que eu identifique na hora e te diga o que aplicar.',
          speakText:
            'Atenção com as folhas manchadas! Pode ser oídio ou míldio pelo excesso de umidade. Aperte o botão da câmera para tirar uma foto, que eu analiso na hora e te digo qual produto biológico usar.',
          actionType: 'open_pest_diagnosis'
        };
      } else {
        return {
          answerText:
            'Hojas con manchas o polvillo blanco suelen ser oídio o falta de aireación. Lo mejor es tomar una foto con el botón "Tomar Foto con IA" para decirte con precisión qué hacer.',
          speakText:
            '¡Cuidado con las hojas manchadas! Podría ser oídio o mildiu. Presiona el botón de la cámara para sacar una foto, y te digo enseguida qué tratamiento natural aplicar.',
          actionType: 'open_pest_diagnosis'
        };
      }
    }

    // 4. What is VPD / Microclimate?
    if (q.includes('vpd') || q.includes('clima') || q.includes('transpiração') || q.includes('transpiracion')) {
      if (isPt) {
        return {
          answerText:
            'O VPD mede se o ar da estufa está muito úmido ou muito seco para as plantas transpirarem. O ideal é ficar entre 0.8 e 1.2 kPa. Se estiver alto, a planta fica com sede; se estiver muito baixo, o ar fica abafado e atrai fungos.',
          speakText:
            'O VPD mostra o conforto das plantas. Se o ar está muito seco, elas transpiram demais e sofrem. Se está abafado, favorece fungos. O ideal é manter entre 0.8 e 1.2.',
          actionType: 'none'
        };
      } else {
        return {
          answerText:
            'El VPD indica qué tan cómodo está el aire para que las plantas respiren y tomen agua. El rango ideal es de 0.8 a 1.2 kPa. Si sube mucho, la planta pasa sed; si baja, la humedad causa hongos.',
          speakText:
            'El VPD mide el confort del cultivo. Entre 0.8 y 1.2 es lo óptimo. Si sube mucho hay sequedad, y si baja mucho se acumula humedad y aparecen hongos.',
          actionType: 'none'
        };
      }
    }

    // 5. Default welcoming advice
    if (isPt) {
      return {
        answerText:
          'Olá, produtor! Sou o Don Mateo, seu assistente da Coop Agronorte. Posso te ajudar a conferir a água das estufas, registrar colheitas ou identificar pragas por foto. Como posso te ajudar hoje?',
        speakText:
          'Olá, companheiro! Sou o Don Mateo, seu assistente técnico aqui da Coop Agronorte. Estou à disposição para conferir suas estufas, ajudar a registrar a colheita ou tirar dúvidas. No que posso te apoiar agora?',
        actionType: 'none'
      };
    } else {
      return {
        answerText:
          '¡Hola, productor! Soy Don Mateo, tu asistente de la Coop Agronorte. Te ayudo a monitorear tus invernaderos, registrar cajas de cosecha o detectar plagas con la cámara. ¿En qué te puedo ayudar hoy?',
        speakText:
          '¡Hola, qué tal! Soy Don Mateo, tu asistente técnico de la Coop Agronorte. Estoy aquí para revisar tus invernaderos, anotar tu cosecha o responder cualquier duda. ¿Qué necesitas hoy?',
        actionType: 'none'
      };
    }
  }
}
