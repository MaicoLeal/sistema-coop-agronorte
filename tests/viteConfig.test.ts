import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { loadConfigFromFile } from 'vite';

const configFile = fileURLToPath(new URL('../vite.config.ts', import.meta.url));

async function loadConfigWithPort(port: string) {
  const previousCwd = process.cwd();
  const previousPort = process.env.LOCAL_API_PORT;
  const temporaryCwd = await mkdtemp(path.join(tmpdir(), 'agronorte-vite-config-'));

  try {
    delete process.env.LOCAL_API_PORT;
    await writeFile(path.join(temporaryCwd, '.env.test'), `LOCAL_API_PORT=${port}\n`);
    process.chdir(temporaryCwd);
    return await loadConfigFromFile(
      { command: 'serve', mode: 'test' },
      configFile,
    );
  } finally {
    process.chdir(previousCwd);
    if (previousPort === undefined) {
      delete process.env.LOCAL_API_PORT;
    } else {
      process.env.LOCAL_API_PORT = previousPort;
    }
    await rm(temporaryCwd, { recursive: true, force: true });
  }
}

test('carrega LOCAL_API_PORT do arquivo de ambiente para os proxies', async () => {
  const loaded = await loadConfigWithPort('9123');
  assert.ok(loaded);

  assert.equal(loaded.config.server?.proxy?.['/api'], 'http://127.0.0.1:9123');
  assert.equal(loaded.config.preview?.proxy?.['/api'], 'http://127.0.0.1:9123');
});

test('aceita os limites válidos de LOCAL_API_PORT', async () => {
  for (const port of ['1', '65535']) {
    const loaded = await loadConfigWithPort(port);
    assert.ok(loaded);
    assert.equal(loaded.config.server?.proxy?.['/api'], `http://127.0.0.1:${port}`);
  }
});

test('rejeita LOCAL_API_PORT fora dos limites ou não inteiro', async () => {
  for (const port of ['0', '1.5', '65536', 'NaN']) {
    await assert.rejects(
      () => loadConfigWithPort(port),
      /LOCAL_API_PORT/,
      `deveria rejeitar ${port}`,
    );
  }
});
