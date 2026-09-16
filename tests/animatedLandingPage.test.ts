import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import * as landingModule from '../src/components/AnimatedLandingPage';

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

test('landing video is optimized for progressive browser playback', () => {
  const video = readFileSync(new URL('../public/assets/video-home.mp4', import.meta.url));
  const moovOffset = video.indexOf(Buffer.from('moov'));
  const mediaOffset = video.indexOf(Buffer.from('mdat'));

  assert.ok(moovOffset > 0, 'MP4 must contain a moov atom');
  assert.ok(mediaOffset > 0, 'MP4 must contain an mdat atom');
  assert.ok(moovOffset < mediaOffset, 'moov atom must precede media data for fast start');
});

test('renders the cinematic hero with background artwork, overlay, and content layer', () => {
  const markup = renderLanding('es-PY');

  assert.match(markup, /data-agronorte-visual=""/);
  assert.match(markup, /class="[^"]*agronorte-visual__frame[^"]*"/);
  assert.match(markup, /class="[^"]*agronorte-visual__art[^"]*"/);
  assert.match(markup, /class="[^"]*agronorte-visual__overlay[^"]*"/);
  assert.match(markup, /class="[^"]*agronorte-visual__content[^"]*"/);
  assert.match(markup, /agronorte-sunrise-hero/);
});

test('renders visible headline, description and action buttons as HTML text', () => {
  const markup = renderLanding('es-PY');

  // Headline text from landingContent
  assert.match(markup, /Agricultura inteligente,/);
  assert.match(markup, /raíces paraguayas/);

  // Description text
  assert.match(markup, /Control de clima, riego y producción en tiempo real/);

  // Primary action button
  assert.match(markup, /Acceder a la plataforma/);

  // Secondary action button
  assert.match(markup, /Conocer la tecnología/);
});

test('renders the interactive enter button with data-action and screen reader headline', () => {
  const spanish = renderLanding('es-PY');
  assert.match(spanish, /data-action="enter-system"/);
  assert.match(spanish, /Agricultura de precisión para un Paraguay más fuerte/);

  const portuguese = renderLanding('pt-BR');
  assert.match(portuguese, /data-action="enter-system"/);
  assert.match(portuguese, /Agricultura de precisão para um Paraguai mais forte/);
});

test('renders bottom indicators for monitoring, cultivation, and sustainability', () => {
  const markup = renderLanding('es-PY');
  assert.match(markup, /Monitoreo en tiempo real/);
  assert.match(markup, /Cultivo hidropónico/);
  assert.match(markup, /Producción sostenible/);
});

test('getLandingPresentation is exported and returns correct states', () => {
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
});

test('landing language semantics follow the selected language', () => {
  const spanish = renderLanding('es-PY');
  assert.match(spanish, /<div[^>]*data-agronorte-visual=""[^>]*lang="es-PY"/);

  const portuguese = renderLanding('pt-BR');
  assert.match(portuguese, /<div[^>]*data-agronorte-visual=""[^>]*lang="pt-BR"/);

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

test('content switches correctly between Spanish and Portuguese', () => {
  const spanish = renderLanding('es-PY');
  assert.match(spanish, /raíces paraguayas/);
  assert.match(spanish, /Acceder a la plataforma/);

  const portuguese = renderLanding('pt-BR');
  assert.match(portuguese, /raízes paraguaias/);
  assert.match(portuguese, /Acessar plataforma/);
});

test('hero renders the Agronorte logo', () => {
  const markup = renderLanding('es-PY');
  assert.match(markup, /logo-oficial-agronorte-white-tight\.png/);
  assert.match(markup, /class="[^"]*agronorte-visual__logo[^"]*"/);
});
