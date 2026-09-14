import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import * as landingModule from '../src/components/AnimatedLandingPage';

const componentSource = readFileSync(
  new URL('../src/components/AnimatedLandingPage.tsx', import.meta.url),
  'utf8',
);
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

function renderLanding(lang: 'es-PY' | 'pt-BR' = 'es-PY') {
  return renderToStaticMarkup(
    React.createElement(landingModule.AnimatedLandingPage, {
      lang,
      onEnter: () => undefined,
      onLanguageChange: () => undefined,
    }),
  );
}

test('producer entry uses the same sm breakpoint as the mobile card', () => {
  const markup = renderLanding();
  assert.match(markup, /class="hidden sm:flex items-center"/);
  assert.match(markup, /class="sm:hidden absolute/);
  assert.doesNotMatch(markup, /class="hidden md:flex items-center"/);
});

test('reduced motion and video failure expose a visible expert entry', () => {
  const getPresentation = Reflect.get(landingModule, 'getLandingPresentation');
  assert.equal(typeof getPresentation, 'function');

  for (const state of [
    { isReady: false, motionEnabled: false, videoFailed: false },
    { isReady: false, motionEnabled: true, videoFailed: true },
  ]) {
    assert.deepEqual(getPresentation(state), {
      videoReady: false,
      showFallbackEntry: true,
      showLoading: false,
    });
  }

  assert.match(componentSource, /showFallbackEntry\s*\?\s*'landing-hero__enter--fallback'/);
});

test('video readiness requires loaded data and motion, while errors settle loading', () => {
  const getPresentation = Reflect.get(landingModule, 'getLandingPresentation');
  assert.equal(typeof getPresentation, 'function');
  assert.deepEqual(
    getPresentation({ isReady: true, motionEnabled: true, videoFailed: false }),
    { videoReady: true, showFallbackEntry: false, showLoading: false },
  );
  assert.deepEqual(
    getPresentation({ isReady: false, motionEnabled: true, videoFailed: false }),
    { videoReady: false, showFallbackEntry: false, showLoading: true },
  );
  assert.deepEqual(
    getPresentation({ isReady: true, motionEnabled: true, videoFailed: true }),
    { videoReady: false, showFallbackEntry: true, showLoading: false },
  );

  assert.match(componentSource, /onError=\{[^}]*setVideoFailed\(true\)[^}]*\}/s);
  assert.match(componentSource, /window\.setTimeout\(\(\)\s*=>\s*setVideoFailed\(true\),\s*VIDEO_LOAD_TIMEOUT_MS\)/);
  assert.match(componentSource, /window\.clearTimeout\(fallbackTimer\)/);
  assert.match(componentSource, /videoReady\s*\?\s*'is-ready'/);
  assert.match(componentSource, /showLoading\s*&&/);
});

test('landing language semantics and accessible image copy follow the selected language', () => {
  const spanish = renderLanding('es-PY');
  assert.match(spanish, /<div[^>]*lang="es-PY"[^>]*aria-label="Página inicial del Sistema Coop Agronorte"/);
  assert.match(spanish, /alt="Invernaderos hidropónicos de la Cooperativa Agronorte en Guayaibí, Paraguay"/);

  const portuguese = renderLanding('pt-BR');
  assert.match(portuguese, /<div[^>]*lang="pt-BR"[^>]*aria-label="Tela inicial do Sistema Coop Agronorte"/);
  assert.match(portuguese, /alt="Estufas hidropônicas da Cooperativa Agronorte em Guayaibí, Paraguai"/);

  assert.match(appSource, /document\.documentElement\.lang\s*=\s*lang/);
});

test('language selector buttons expose their pressed state', () => {
  const spanish = renderLanding('es-PY');
  assert.match(spanish, /title="Español \(Paraguay\)"[^>]*aria-pressed="true"/);
  assert.match(spanish, /title="Português \(Brasil\)"[^>]*aria-pressed="false"/);

  const portuguese = renderLanding('pt-BR');
  assert.match(portuguese, /title="Español \(Paraguay\)"[^>]*aria-pressed="false"/);
  assert.match(portuguese, /title="Português \(Brasil\)"[^>]*aria-pressed="true"/);
});
