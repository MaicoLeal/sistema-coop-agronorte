import assert from 'node:assert/strict';
import test from 'node:test';
import type { AddressInfo } from 'node:net';

import { createLocalApi } from '../server/localApi';

test('POST /api/assistant/chat encaminha a pergunta ao assistente local', async (t) => {
  const received: unknown[] = [];
  const app = createLocalApi({
    assistant: {
      async answer(request) {
        received.push(request);
        return {
          answerText: 'O Ollama respondeu localmente.',
          speakText: 'O Ollama respondeu localmente.',
          actionType: 'none',
        };
      },
    },
    model: 'gemma4:12b',
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  t.after(() => server.close());

  const { port } = server.address() as AddressInfo;
  const response = await fetch(`http://127.0.0.1:${port}/api/assistant/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: 'Explique o VPD.', language: 'pt-BR' }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    answerText: 'O Ollama respondeu localmente.',
    speakText: 'O Ollama respondeu localmente.',
    actionType: 'none',
    provider: 'ollama',
    model: 'gemma4:12b',
  });
  assert.deepEqual(received, [
    { query: 'Explique o VPD.', language: 'pt-BR', context: undefined },
  ]);
});

test('GET /api/health identifica o provedor e o modelo locais', async (t) => {
  const app = createLocalApi({
    assistant: {
      async answer() {
        throw new Error('não deve ser chamado');
      },
    },
    model: 'gemma4:12b',
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  t.after(() => server.close());

  const { port } = server.address() as AddressInfo;
  const response = await fetch(`http://127.0.0.1:${port}/api/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'ok',
    provider: 'ollama',
    model: 'gemma4:12b',
  });
});
