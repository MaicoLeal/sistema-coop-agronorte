import 'dotenv/config';

import { parseOllamaTimeoutMs } from './config';
import { createLocalApi } from './localApi';
import { createOllamaAssistant } from './ollamaAssistant';

const port = Number(process.env.LOCAL_API_PORT ?? 8787);
const host = process.env.LOCAL_API_HOST ?? '127.0.0.1';
const model = process.env.OLLAMA_MODEL ?? 'gemma4:12b';
const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434';
const timeoutMs = parseOllamaTimeoutMs(process.env.OLLAMA_TIMEOUT_MS);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('LOCAL_API_PORT deve ser uma porta válida.');
}

const assistant = createOllamaAssistant({ baseUrl, model, timeoutMs });
const app = createLocalApi({ assistant, model });

app.listen(port, host, () => {
  console.log(`API local Agronorte: http://${host}:${port}`);
  console.log(`Ollama: ${baseUrl} | modelo: ${model}`);
});
