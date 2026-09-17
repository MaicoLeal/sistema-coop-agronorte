export type AssistantAction =
  | 'open_harvest'
  | 'open_pest_diagnosis'
  | 'show_greenhouses'
  | 'none';

export interface FarmerAssistantRequest {
  query: string;
  language: 'pt-BR' | 'es-PY';
  context?: Record<string, unknown>;
}

export interface FarmerAssistantResponse {
  answerText: string;
  speakText: string;
  actionType: AssistantAction;
}

interface OllamaAssistantOptions {
  baseUrl: string;
  model: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

const VALID_ACTIONS = new Set<AssistantAction>([
  'open_harvest',
  'open_pest_diagnosis',
  'show_greenhouses',
  'none',
]);

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    answerText: { type: 'string' },
    speakText: { type: 'string' },
    actionType: {
      type: 'string',
      enum: ['open_harvest', 'open_pest_diagnosis', 'show_greenhouses', 'none'],
    },
  },
  required: ['answerText', 'speakText', 'actionType'],
};

function parseAssistantResponse(content: string): FarmerAssistantResponse {
  const parsed = JSON.parse(content) as Partial<FarmerAssistantResponse>;

  if (
    typeof parsed.answerText !== 'string' ||
    typeof parsed.speakText !== 'string' ||
    !VALID_ACTIONS.has(parsed.actionType as AssistantAction)
  ) {
    throw new Error('Ollama devolveu uma resposta em formato inválido.');
  }

  return {
    answerText: parsed.answerText,
    speakText: parsed.speakText,
    actionType: parsed.actionType as AssistantAction,
  };
}

function buildSystemPrompt(language: FarmerAssistantRequest['language']): string {
  const outputLanguage = language === 'pt-BR' ? 'português do Brasil' : 'espanhol do Paraguai';

  return [
    'Você é Don Mateo, assistente técnico agrícola sênior da Cooperativa Agronorte (Paraguai).',
    `Responda sempre em ${outputLanguage}, com linguagem acolhedora, prática e clara para produtores rurais.`,
    'Você possui sólida base técnica nos seguintes pilares da cooperativa:',
    '1. HIDROPONIA: Sistemas NFT e semi-hidroponia em substrato (fibra de coco/casca de arroz). pH ideal de 5.8 a 6.2 (correção com ácido nítrico/fosfórico para descer e hidróxido de potássio para subir). Temperatura da solução nutritiva entre 18°C e 24°C para manter oxigenação radicular.',
    '2. CULTIVO DE TOMATE: pH 5.8-6.3, EC entre 2.0 e 2.8 mS/cm. Condução vertical com fitilho, desbrota semanal de ramos axilares (ladrões) pela manhã, desfolha baixeira para aeração. Podridão apical (fundo preto) decorre de deficiência de Cálcio por estresse hídrico ou calor; corrigir com equilíbrio de fertirrigação e cálcio foliar.',
    '3. CULTIVO DE PIMENTÃO VERDE (LOCOTE): Variedades como Nathalie F1. pH 5.8-6.2, EC entre 1.8 e 2.4 mS/cm (mais sensível à salinidade que o tomate). Poda obrigatória da primeira flor ("flor rei") na primeira bifurcação para não travar o crescimento vegetativo. Temperatura ideal de 22°C a 28°C; temperaturas acima de 32°C ou abaixo de 15°C causam aborto floral. Colher com paredes espessas, verde escuro brilhante e pedúnculo de 2-3 cm.',
    '4. ESTUFAS E MICROCLIMA: Faixa ótima de VPD entre 0.8 e 1.2 kPa. Estufa 1 monitora Tomate e Estufa 2 monitora Locote Verde.',
    '5. AÇÕES DO SISTEMA (actionType): Escolha "show_greenhouses" para consultas de sensores e clima das estufas; "open_harvest" para registrar colheita e caixas; "open_pest_diagnosis" para suspeitas de pragas, fungos ou manchas nas folhas; caso contrário use "none".',
    'Nunca invente falsas leituras de sensores além dos dados fornecidos no contexto.',
    'answerText e speakText devem ser concisos, naturais e coerentes entre si.',
  ].join(' ');
}

export function createOllamaAssistant(options: OllamaAssistantOptions) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = options.baseUrl.replace(/\/+$/, '');

  return {
    async answer(request: FarmerAssistantRequest): Promise<FarmerAssistantResponse> {
      const response = await fetchImpl(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: AbortSignal.timeout(options.timeoutMs ?? 30_000),
        body: JSON.stringify({
          model: options.model,
          stream: false,
          think: false,
          format: RESPONSE_SCHEMA,
          keep_alive: '10m',
          options: {
            temperature: 0.2,
            num_ctx: 4096,
            num_predict: 350,
          },
          messages: [
            { role: 'system', content: buildSystemPrompt(request.language) },
            {
              role: 'user',
              content: JSON.stringify({
                question: request.query,
                context: request.context ?? {},
              }),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha ao consultar o Ollama local (${response.status}).`);
      }

      const payload = (await response.json()) as {
        message?: { content?: string };
      };
      const content = payload.message?.content;

      if (!content) {
        throw new Error('Ollama não devolveu conteúdo.');
      }

      return parseAssistantResponse(content);
    },
  };
}
