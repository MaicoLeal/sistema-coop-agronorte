export function parseOllamaTimeoutMs(value: string | undefined): number {
  const timeoutMs = Number(value ?? 30_000);

  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2_147_483_647) {
    throw new Error('OLLAMA_TIMEOUT_MS deve ser um inteiro entre 1 e 2147483647.');
  }

  return timeoutMs;
}
