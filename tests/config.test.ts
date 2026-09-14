import assert from 'node:assert/strict';
import test from 'node:test';

import { parseOllamaTimeoutMs } from '../server/config';

test('aceita os limites inteiros de OLLAMA_TIMEOUT_MS', () => {
  assert.equal(parseOllamaTimeoutMs('1'), 1);
  assert.equal(parseOllamaTimeoutMs('2147483647'), 2_147_483_647);
});

test('rejeita OLLAMA_TIMEOUT_MS fora dos limites ou não inteiro', () => {
  for (const value of ['0', '1.5', '2147483648', 'NaN', 'Infinity']) {
    assert.throws(
      () => parseOllamaTimeoutMs(value),
      /OLLAMA_TIMEOUT_MS/,
      `deveria rejeitar ${value}`,
    );
  }
});
