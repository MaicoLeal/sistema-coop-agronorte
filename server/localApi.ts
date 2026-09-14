import express from 'express';

import type {
  FarmerAssistantRequest,
  FarmerAssistantResponse,
} from './ollamaAssistant';

interface FarmerAssistant {
  answer(request: FarmerAssistantRequest): Promise<FarmerAssistantResponse>;
}

interface LocalApiOptions {
  assistant: FarmerAssistant;
  model: string;
}

const SUPPORTED_LANGUAGES = new Set(['pt-BR', 'es-PY']);

export function createLocalApi(options: LocalApiOptions) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '256kb' }));

  app.get('/api/health', (_request, response) => {
    response.json({
      status: 'ok',
      provider: 'ollama',
      model: options.model,
    });
  });

  app.post('/api/assistant/chat', async (request, response) => {
    const { query, language, context } = request.body ?? {};

    if (
      typeof query !== 'string' ||
      query.trim().length === 0 ||
      query.length > 4000 ||
      !SUPPORTED_LANGUAGES.has(language) ||
      (context !== undefined &&
        (typeof context !== 'object' || context === null || Array.isArray(context)))
    ) {
      response.status(400).json({ error: 'Consulta inválida.' });
      return;
    }

    try {
      const result = await options.assistant.answer({
        query: query.trim(),
        language,
        context,
      });

      response.json({
        ...result,
        provider: 'ollama',
        model: options.model,
      });
    } catch (error) {
      console.error('[local-ai] Falha ao consultar Ollama:', error);
      response.status(503).json({
        error: 'A IA local está temporariamente indisponível.',
      });
    }
  });

  return app;
}
