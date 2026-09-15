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

test('landing video is optimized for progressive browser playback', () => {
  const video = readFileSync(new URL('../public/assets/video-home.mp4', import.meta.url));
  const moovOffset = video.indexOf(Buffer.from('moov'));
  const mediaOffset = video.indexOf(Buffer.from('mdat'));

  assert.ok(moovOffset > 0, 'MP4 must contain a moov atom');
  assert.ok(mediaOffset > 0, 'MP4 must contain an mdat atom');
  assert.ok(moovOffset < mediaOffset, 'moov atom must precede media data for fast start');
});

test('landing uses the approved reference video with a static fallback', () => {
  const markup = renderLanding();

  assert.match(markup, /<video[^>]*autoPlay=""[^>]*muted=""[^>]*loop=""[^>]*playsInline=""/);
  assert.match(markup, /<source[^>]*src="\/assets\/video-home\.mp4"[^>]*type="video\/mp4"/);
  assert.match(markup, /<img[^>]*src="\/assets\/agronorte-reference-hero\.jpg"/);
});

test('landing exposes separate producer and administration access buttons', () => {
  const spanish = renderLanding('es-PY');

  assert.match(spanish, /<button[^>]*data-access="producer"[^>]*>.*Acceso productor.*<\/button>/s);
  assert.match(spanish, /<button[^>]*data-access="administration"[^>]*>.*Acceso administración.*<\/button>/s);
});

test('reference feature areas are real interactive controls', () => {
  const markup = renderLanding('es-PY');
  const featureButtons = markup.match(/data-feature="[^"]+"/g) ?? [];

  assert.equal(featureButtons.length, 4);
  assert.match(markup, /aria-live="polite"/);
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

test('landing language semantics and accessible image copy follow the selected language', () => {
  const spanish = renderLanding('es-PY');
  assert.match(spanish, /<div[^>]*lang="es-PY"[^>]*aria-label="Página inicial del Sistema Coop Agronorte"/);
  assert.match(spanish, /alt="Cooperativa Agronorte"/);

  const portuguese = renderLanding('pt-BR');
  assert.match(portuguese, /<div[^>]*lang="pt-BR"[^>]*aria-label="Tela inicial do Sistema Coop Agronorte"/);

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
