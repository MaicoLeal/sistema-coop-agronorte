import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const packageJson = JSON.parse(readFileSync(`${root}/package.json`, 'utf8'));
const packageLock = JSON.parse(readFileSync(`${root}/package-lock.json`, 'utf8'));

test('exige Node 22.12.0 ou superior no manifesto e no lockfile', () => {
  assert.equal(packageJson.engines.node, '>=22.12.0');
  assert.equal(packageLock.packages[''].engines.node, '>=22.12.0');
});
