import assert from 'node:assert/strict';
import test from 'node:test';

import { requestLocalFarmerAnswer } from '../src/services/localAiService';

test('cliente web consulta a API local sem acessar a porta do Ollama diretamente', async () => {
  let receivedUrl = '';
  let receivedBody: unknown;

  const fakeFetch: typeof fetch = async (input, init) => {
    receivedUrl = String(input);
    receivedBody = JSON.parse(String(init?.body));

    return new Response(
      JSON.stringify({
        answerText: 'Resposta local.',
        speakText: 'Resposta local.',
        actionType: 'none',
        provider: 'ollama',
        model: 'gemma4:12b',
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  const result = await requestLocalFarmerAnswer(
    { query: 'Olá', language: 'pt-BR' },
    fakeFetch,
  );

  assert.equal(receivedUrl, '/api/assistant/chat');
  assert.deepEqual(receivedBody, { query: 'Olá', language: 'pt-BR' });
  assert.deepEqual(result, {
    answerText: 'Resposta local.',
    speakText: 'Resposta local.',
    actionType: 'none',
  });
});
