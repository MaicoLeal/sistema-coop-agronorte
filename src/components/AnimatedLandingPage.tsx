import React, { useEffect, useState } from 'react';
import { ArrowRight, Pause, Play, Leaf } from 'lucide-react';
import { Language } from '../types';
import { LANDING_CONTENT } from '../config/landingContent';
import LandingScene from './LandingScene';

type LandingPresentationState = {
  isReady: boolean;
  motionEnabled: boolean;
  videoFailed: boolean;
};

export function getLandingPresentation({ isReady, motionEnabled, videoFailed }: LandingPresentationState) {
  const videoReady = isReady && motionEnabled && !videoFailed;
  return {
    videoReady,
    showFallbackEntry: !motionEnabled || videoFailed,
    showLoading: motionEnabled && !isReady && !videoFailed,
  };
}

type Props = {
  onEnter: (mode?: 'producer_easy' | 'expert_management') => void;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
};

export function AnimatedLandingPage({ onEnter, lang = 'es-PY', onLanguageChange }: Props) {
  const [motionEnabled, setMotionEnabled] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyPreference = () => setMotionEnabled(!reducedMotion.matches);
    applyPreference();
    reducedMotion.addEventListener('change', applyPreference);
    return () => reducedMotion.removeEventListener('change', applyPreference);
  }, []);

  const toggleMotion = () => {
    setMotionEnabled((curr) => !curr);
  };

  const content = LANDING_CONTENT[lang];

  return (
    <div
      className={`w-full min-h-screen bg-[#071e19] ${motionEnabled ? 'has-motion' : 'reduced-motion'}`}
      data-agronorte-visual=""
      data-kid="1"
      data-name="page layout container"
      lang={lang}
    >
      <main
        aria-label={content.sceneLabel}
        className="agronorte-visual__frame"
        data-kid="1-1"
        data-name="main cinematic hero container"
      >
        {/* Background photograph */}
        <picture>
          <source srcSet="/assets/agronorte-sunrise-hero.webp" type="image/webp" />
          <img
            alt={content.sceneLabel}
            className="agronorte-visual__art"
            data-kid="1-1-1"
            data-name="background hero image"
            decoding="async"
            draggable={false}
            src="/assets/agronorte-sunrise-hero.jpg"
          />
        </picture>

        {/* Dynamic WebGL Animated Flag & Cinemagraph */}
        <LandingScene
          active={motionEnabled}
          className="agronorte-visual__canvas-container"
        />

        {/* Cinematic gradient overlay */}
        <div
          className="agronorte-visual__overlay"
          aria-hidden="true"
          data-kid="1-1-2"
          data-name="cinematic gradient overlay"
        />

        {/* Decorative foreground leaf */}
        <img
          alt=""
          aria-hidden="true"
          className="agronorte-visual__leaf"
          data-kid="1-1-3"
          data-name="decorative foreground leaf"
          decoding="async"
          draggable={false}
          src="/assets/agronorte-foreground-leaves.png"
        />

        {/* Logo / Brand Spotlight */}
        <div
          className="agronorte-visual__brand"
          data-kid="1-1-4-wrapper"
          data-name="brand spotlight container"
        >
          <img
            alt="Cooperativa Agronorte"
            className="agronorte-visual__logo"
            data-kid="1-1-4"
            data-name="agronorte logo"
            decoding="async"
            draggable={false}
            src="/assets/logo-oficial-agronorte-white-tight.png"
          />
        </div>

        {/* Top-right toolbar: Language & Motion Toggle */}
        <div className="agronorte-visual__toolbar" aria-label="Controles visuais">
          {onLanguageChange && (
            <div className="agronorte-visual__lang" aria-label="Idioma">
              <button
                type="button"
                className={`agronorte-visual__lang-btn ${lang === 'es-PY' ? 'is-active' : ''}`}
                title="Español (Paraguay)"
                aria-pressed={lang === 'es-PY'}
                onClick={() => onLanguageChange('es-PY')}
              >
                ES
              </button>
              <button
                type="button"
                className={`agronorte-visual__lang-btn ${lang === 'pt-BR' ? 'is-active' : ''}`}
                title="Português (Brasil)"
                aria-pressed={lang === 'pt-BR'}
                onClick={() => onLanguageChange('pt-BR')}
              >
                PT
              </button>
            </div>
          )}

          <button
            type="button"
            className="agronorte-visual__motion-btn"
            onClick={toggleMotion}
            title={motionEnabled ? content.pauseMotion : content.resumeMotion}
            aria-label={motionEnabled ? content.pauseMotion : content.resumeMotion}
          >
            {motionEnabled ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>

        {/* Screen reader headline (visually hidden) */}
        <h1
          className="agronorte-visual__sr-title"
          data-kid="1-1-5"
          data-name="hero screen reader headline"
        >
          {lang === 'es-PY'
            ? 'Agricultura de precisión para un Paraguay más fuerte'
            : 'Agricultura de precisão para um Paraguai mais forte'}
        </h1>

        {/* ─── VISIBLE CONTENT LAYER ─── */}
        <div className="agronorte-visual__content">
          {/* Location chip */}
          <div className="agronorte-visual__location">
            <span className="agronorte-visual__location-dot" aria-hidden="true" />
            {content.locationLabel}
          </div>

          {/* Eyebrow */}
          <span className="agronorte-visual__eyebrow">{content.eyebrow}</span>

          {/* Visible headline */}
          <h2
            className="agronorte-visual__headline"
            aria-hidden="true"
          >
            {content.titleLine1}
            <br />
            <span className="agronorte-visual__headline-accent">{content.titleLine2}</span>
          </h2>

          {/* Description */}
          <p className="agronorte-visual__desc">{content.description}</p>

          {/* Action buttons */}
          <div className="agronorte-visual__actions">
            <button
              type="button"
              className="agronorte-visual__enter-btn"
              data-action="enter-system"
              onClick={() => onEnter('producer_easy')}
              aria-label={content.enterSystem}
              title={content.enterSystem}
            >
              <span className="agronorte-visual__enter-ripple" aria-hidden="true" />
              <span className="agronorte-visual__enter-label">{content.primaryAction}</span>
              <ArrowRight size={18} className="agronorte-visual__enter-arrow" />
            </button>

            <button
              type="button"
              className="agronorte-visual__secondary-btn"
              onClick={() => onEnter('expert_management')}
              aria-label={content.secondaryAction}
              title={content.secondaryAction}
            >
              <Leaf size={16} />
              <span>{content.secondaryAction}</span>
            </button>
          </div>
        </div>

        {/* ─── BOTTOM INDICATORS ─── */}
        <div className="agronorte-visual__indicators" aria-label={lang === 'es-PY' ? 'Indicadores' : 'Indicadores'}>
          {content.indicators.map((ind) => (
            <div key={ind.id} className="agronorte-visual__indicator">
              <span className="agronorte-visual__indicator-label">{ind.label}</span>
              <span className="agronorte-visual__indicator-detail">{ind.detail}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
