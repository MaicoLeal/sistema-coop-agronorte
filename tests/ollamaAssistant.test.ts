import assert from 'node:assert/strict';
import test from 'node:test';

import { createOllamaAssistant } from '../server/ollamaAssistant';

test('envia a consulta agrícola ao Ollama local e devolve resposta estruturada', async () => {
  let receivedUrl = '';
  let receivedBody: Record<string, unknown> | undefined;

  const fakeFetch: typeof fetch = async (input, init) => {
    receivedUrl = String(input);
    receivedBody = JSON.parse(String(init?.body));

    return new Response(
      JSON.stringify({
        message: {
          role: 'assistant',
          content: JSON.stringify({
            answerText: 'Resposta técnica em português.',
            speakText: 'Resposta técnica em português.',
            actionType: 'none',
          }),
        },
        done: true,
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  const assistant = createOllamaAssistant({
    baseUrl: 'http://127.0.0.1:11434',
    model: 'gemma4:12b',
    fetchImpl: fakeFetch,
  });

  const result = await assistant.answer({
    query: 'Como está o cultivo?',
    language: 'pt-BR',
  });

  assert.equal(receivedUrl, 'http://127.0.0.1:11434/api/chat');
  assert.equal(receivedBody?.model, 'gemma4:12b');
  assert.equal(receivedBody?.stream, false);
  assert.equal(receivedBody?.think, false);
  assert.deepEqual(result, {
    answerText: 'Resposta técnica em português.',
    speakText: 'Resposta técnica em português.',
    actionType: 'none',
  });
});

test('cancela a consulta ao Ollama quando o tempo limite é excedido', async () => {
  let receivedSignal: AbortSignal | undefined;

  const hangingFetch: typeof fetch = async (_input, init) => {
    receivedSignal = init?.signal ?? undefined;

    return new Promise<Response>((_resolve, reject) => {
      const keepEventLoopAlive = setTimeout(() => {}, 100);
      receivedSignal?.addEventListener('abort', () => {
        clearTimeout(keepEventLoopAlive);
        reject(receivedSignal?.reason);
      });
    });
  };

  const assistant = createOllamaAssistant({
    baseUrl: 'http://127.0.0.1:11434',
    model: 'gemma4:12b',
    timeoutMs: 10,
    fetchImpl: hangingFetch,
  });

  await assert.rejects(
    assistant.answer({ query: 'Como está o cultivo?', language: 'pt-BR' }),
    (error: unknown) => error instanceof DOMException && error.name === 'TimeoutError',
  );
  assert.equal(receivedSignal?.aborted, true);
});
