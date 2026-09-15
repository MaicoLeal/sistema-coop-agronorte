import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Globe2,
  Leaf,
  Monitor,
  Pause,
  Play,
  Route,
  Sprout,
} from 'lucide-react';
import { LANDING_CONTENT } from '../config/landingContent';
import { Language } from '../types';

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

const FEATURE_ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  cultivation: Sprout,
  telemetry: Monitor,
  traceability: Route,
  sustainability: Globe2,
};

const UI_COPY = {
  'es-PY': {
    ariaLabel: 'Página inicial del Sistema Coop Agronorte',
    producer: 'Acceso productor',
    administration: 'Acceso administración',
    accessLabel: 'Seleccione cómo desea ingresar',
    explore: 'Conozca nuestras soluciones',
    loading: 'Preparando experiencia visual…',

  },
  'pt-BR': {
    ariaLabel: 'Tela inicial do Sistema Coop Agronorte',
    producer: 'Acesso do produtor',
    administration: 'Acesso administrativo',
    accessLabel: 'Selecione como deseja entrar',
    explore: 'Conheça nossas soluções',
    loading: 'Preparando experiência visual…',

  },
} as const;

type Props = {
  onEnter: (mode?: 'producer_easy' | 'expert_management') => void;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
};

export function AnimatedLandingPage({ onEnter, lang = 'es-PY', onLanguageChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const content = LANDING_CONTENT[lang];
  const copy = UI_COPY[lang];
  const presentation = getLandingPresentation({ isReady, motionEnabled, videoFailed });
  const selectedFeature = activeFeature === null ? null : content.features[activeFeature];

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyPreference = () => setMotionEnabled(!reducedMotion.matches);
    applyPreference();
    reducedMotion.addEventListener('change', applyPreference);
    return () => reducedMotion.removeEventListener('change', applyPreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return;

    if (motionEnabled) {
      void video.play().catch(() => setVideoFailed(true));
    } else {
      video.pause();
    }
  }, [motionEnabled, videoFailed]);

  const toggleMotion = () => {
    if (videoFailed) return;
    setMotionEnabled((current) => !current);
  };

  return (
    <div className="reference-landing" lang={lang} aria-label={copy.ariaLabel}>
      <div className="reference-landing__ambient" aria-hidden="true" />

      <section className="reference-artboard" aria-describedby="landing-feature-description">
        <img
          className="reference-artboard__fallback"
          src="/assets/agronorte-reference-hero.jpg"
          alt="Cooperativa Agronorte"
          draggable={false}
        />
        <video
          ref={videoRef}
          className={`reference-artboard__video${presentation.videoReady ? ' is-ready' : ''}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/agronorte-reference-hero.jpg"
          onLoadedData={() => setIsReady(true)}
          onError={() => setVideoFailed(true)}
          aria-hidden="true"
        >
          <source src="/assets/video-home.mp4" type="video/mp4" />
        </video>

        <div className="reference-artboard__vignette" aria-hidden="true" />

        <div className="reference-toolbar">
          {onLanguageChange && (
            <div className="reference-languages" aria-label="Idioma">
              <button
                type="button"
                title="Español (Paraguay)"
                aria-pressed={lang === 'es-PY'}
                onClick={() => onLanguageChange('es-PY')}
              >
                ES
              </button>
              <button
                type="button"
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
            className="reference-motion"
            onClick={toggleMotion}
            disabled={videoFailed}
            title={motionEnabled ? content.pauseMotion : content.resumeMotion}
            aria-label={motionEnabled ? content.pauseMotion : content.resumeMotion}
          >
            {motionEnabled ? <Pause size={17} /> : <Play size={17} />}
          </button>
        </div>

        <nav className="reference-features" aria-label={copy.explore}>
          {content.features.map((feature, index) => {
            const Icon = FEATURE_ICONS[feature.id] ?? Leaf;
            return (
              <button
                key={feature.id}
                type="button"
                data-feature={feature.id}
                aria-pressed={activeFeature === index}
                aria-label={`${feature.label}: ${feature.detail}`}
                onMouseEnter={() => setActiveFeature(index)}
                onFocus={() => setActiveFeature(index)}
                onClick={() => setActiveFeature(index)}
              >
                <Icon size={15} strokeWidth={1.8} />
                <span>{feature.label}</span>
              </button>
            );
          })}
        </nav>

        <div
          className={`reference-feature-detail${selectedFeature ? '' : ' is-empty'}`}
          id="landing-feature-description"
          aria-live="polite"
        >
          {selectedFeature && (
            <>
              <strong>{selectedFeature.label}</strong>
              <span>{selectedFeature.detail}</span>
            </>
          )}
        </div>

        <div className="reference-access" aria-label={copy.accessLabel}>
          <button
            type="button"
            className="reference-access__button reference-access__button--producer"
            data-access="producer"
            onClick={() => onEnter('producer_easy')}
          >
            <Sprout size={17} strokeWidth={2} />
            <span>{copy.producer}</span>
            <ArrowRight size={16} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            className="reference-access__button reference-access__button--admin"
            data-access="administration"
            onClick={() => onEnter('expert_management')}
          >
            <Monitor size={17} strokeWidth={2} />
            <span>{copy.administration}</span>
            <ArrowRight size={16} strokeWidth={2.4} />
          </button>
        </div>

        {presentation.showLoading && (
          <span className="reference-loading" role="status">{copy.loading}</span>
        )}
        {videoFailed && (
          <span className="reference-status" role="status">Modo visual estático</span>
        )}
      </section>
    </div>
  );
}
