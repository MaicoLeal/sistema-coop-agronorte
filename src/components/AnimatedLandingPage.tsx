import React, { useState } from 'react';
import {
  ArrowRight,
  Droplets,
  Globe,
  Leaf,
  MapPin,
  Monitor,
  Pause,
  Play,
  Sprout,
  Thermometer,
  Users,
  ChartNoAxesCombined,
  Lightbulb,
} from 'lucide-react';
import { Language } from '../types';
import { LANDING_CONTENT, LANDING_CONTACTS } from '../config/landingContent';
import LandingScene from './LandingScene';
import './AnimatedLandingPage.css';

/* ─── Backward-compatible presentation logic (exported for tests) ─── */
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

/* ─── Feature icons mapped by id ─── */
const FEATURE_ICONS: Record<string, React.FC<{ className?: string; strokeWidth?: number }>> = {
  cultivation: Sprout,
  telemetry: Monitor,
  traceability: ArrowRight,
  sustainability: Globe,
};

/* ─── Stat icons mapped by id ─── */
const STAT_ICONS: Record<string, React.FC<{ className?: string; strokeWidth?: number }>> = {
  plants: Sprout,
  people: Users,
  progress: ChartNoAxesCombined,
  innovation: Lightbulb,
};

/* ─── i18n labels for non-config copy ─── */
const UI_LABELS = {
  'es-PY': {
    hydroponics: 'HIDROPONÍA INTELIGENTE',
    tagline: 'TECNOLOGÍA QUE PRODUCE\nUN MEJOR MAÑANA',
    temp: '26.4 °C',
    humidity: '68 %',
    ph: '6.1 pH',
    ec: '2.1 mS/cm',
    cultivos: 'CULTIVOS QUE\nCONECTAN PERSONAS',
    coop: 'COOPERATIVA AGRONORTE',
    dev: 'DESARROLLADO PARA PRODUCIR EN PARAGUAY',
    scroll: 'SCROLL PARA CONOCER MÁS',
    land: 'TIERRA DE\nOPORTUNIDADES',
    fromField: 'DESDE EL CAMPO, PARA UN MAÑANA MEJOR',
    communities: 'COMUNIDADES\nPRODUCIENDO FUTURO',
    location: 'Guayaibí, San Pedro\nParaguay',
    producerMode: 'Modo Fácil Productor · Don Mateo IA',
    ariaLabel: 'Página inicial del Sistema Coop Agronorte',
    fallbackAlt: 'Invernaderos hidropónicos de la Cooperativa Agronorte en Guayaibí, Paraguay',
  },
  'pt-BR': {
    hydroponics: 'HIDROPONIA INTELIGENTE',
    tagline: 'TECNOLOGIA QUE PRODUZ\nUM AMANHÃ MELHOR',
    temp: '26.4 °C',
    humidity: '68 %',
    ph: '6.1 pH',
    ec: '2.1 mS/cm',
    cultivos: 'CULTIVOS QUE\nCONECTAM PESSOAS',
    coop: 'COOPERATIVA AGRONORTE',
    dev: 'DESENVOLVIDO PARA PRODUZIR NO PARAGUAI',
    scroll: 'ROLE PARA CONHECER MAIS',
    land: 'TERRA DE\nOPORTUNIDADES',
    fromField: 'DO CAMPO, PARA UM AMANHÃ MELHOR',
    communities: 'COMUNIDADES\nPRODUZINDO FUTURO',
    location: 'Guayaibí, San Pedro\nParaguai',
    producerMode: 'Modo Fácil Produtor · Don Mateo IA',
    ariaLabel: 'Tela inicial do Sistema Coop Agronorte',
    fallbackAlt: 'Estufas hidropônicas da Cooperativa Agronorte em Guayaibí, Paraguai',
  },
} as const;

type Props = {
  onEnter: (mode?: 'producer_easy' | 'expert_management') => void;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
};

export function AnimatedLandingPage({ onEnter, lang = 'es-PY', onLanguageChange }: Props) {
  const [sceneActive, setSceneActive] = useState(true);
  const content = LANDING_CONTENT[lang];
  const labels = UI_LABELS[lang];
  const contacts = LANDING_CONTACTS;

  return (
    <div className="agronorte-landing" lang={lang} aria-label={labels.ariaLabel}>
      {/* ═══ HERO STAGE ═══ */}
      <section className="landing-stage">
        {/* WebGL cinemagraph background */}
        <LandingScene active={sceneActive} />

        {/* Gradient overlay for text readability */}
        <div className="landing-stage__shade" />

        {/* ─── Header: Logo + Location + Languages + Pause ─── */}
        <header className="landing-header">
          <div className="landing-brand">
            <img
              src="/assets/logo-oficial-agronorte-tight.png"
              alt="Cooperativa Agronorte"
              draggable={false}
            />
          </div>

          <div className="landing-header__tools">
            {/* Location badge */}
            <span className="landing-place">
              <MapPin size={14} strokeWidth={2} />
              <span>{labels.location.split('\n').join(', ')}</span>
            </span>

            {/* Communities badge (desktop only) */}
            <span className="landing-communities-badge">
              {labels.communities.split('\n').map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </span>

            {/* Language selector */}
            {onLanguageChange && (
              <div className="landing-languages">
                <button
                  type="button"
                  onClick={() => onLanguageChange('es-PY')}
                  aria-pressed={lang === 'es-PY'}
                  title="Español (Paraguay)"
                >
                  🇵🇾 ES
                </button>
                <span />
                <button
                  type="button"
                  onClick={() => onLanguageChange('pt-BR')}
                  aria-pressed={lang === 'pt-BR'}
                  title="Português (Brasil)"
                >
                  🇧🇷 PT
                </button>
              </div>
            )}

            {/* Pause/Play animation */}
            <button
              type="button"
              className="landing-motion"
              onClick={() => setSceneActive((prev) => !prev)}
              title={sceneActive ? content.pauseMotion : content.resumeMotion}
              aria-label={sceneActive ? content.pauseMotion : content.resumeMotion}
            >
              {sceneActive ? <Pause size={18} /> : <Play size={18} />}
            </button>
          </div>
        </header>

        {/* ─── Hero Content: Titles + Tagline + Buttons ─── */}
        <div className="landing-intro">
          {/* Sub-brand */}
          <p className="landing-hydroponics">{labels.hydroponics}</p>

          {/* Paraguayan flag colors bar */}
          <div className="landing-flag-bar">
            <span className="landing-flag-bar__red" />
            <span className="landing-flag-bar__white" />
            <span className="landing-flag-bar__blue" />
          </div>

          {/* Tagline */}
          <p className="landing-tagline">
            {labels.tagline.split('\n').map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </p>

          {/* Main title */}
          <h1>
            {content.titleLine1}{' '}
            <span>{content.titleLine2}</span>
          </h1>

          {/* Subtitle */}
          <p className="landing-intro__slogan">{content.subtitle}</p>

          {/* Features row */}
          <div className="landing-features-row">
            {content.features.map((feat) => {
              const Icon = FEATURE_ICONS[feat.id] || Globe;
              return (
                <div key={feat.id} className="landing-feature-item">
                  <Icon size={22} strokeWidth={1.5} />
                  <div>
                    <span>{feat.label}</span>
                    <small>{feat.detail}</small>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="landing-actions">
            <button
              type="button"
              className="landing-entry"
              onClick={() => onEnter('expert_management')}
              aria-label={content.enter}
            >
              <span>{content.enter.toUpperCase()}</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              className="landing-producer"
              onClick={() => onEnter('producer_easy')}
              aria-label={labels.producerMode}
            >
              <span>🌾</span>
              <span>{labels.producerMode}</span>
            </button>
          </div>

          {/* Footer texts below buttons */}
          <p className="landing-coop-label">{labels.coop}</p>
          <p className="landing-dev-label">{labels.dev}</p>
        </div>

        {/* ─── Telemetry HUD (floating, right side, desktop) ─── */}
        <aside className="landing-hud" aria-label="Telemetría IoT">
          <div className="landing-hud__row">
            <Thermometer size={16} strokeWidth={1.8} />
            <span>{labels.temp}</span>
          </div>
          <div className="landing-hud__row">
            <Droplets size={16} strokeWidth={1.8} />
            <span>{labels.humidity}</span>
          </div>
          <div className="landing-hud__row">
            <Leaf size={16} strokeWidth={1.8} />
            <span>{labels.ph}</span>
          </div>
          <div className="landing-hud__row">
            <ChartNoAxesCombined size={16} strokeWidth={1.8} />
            <span>{labels.ec}</span>
          </div>
        </aside>

        {/* ─── Center logo badge ─── */}
        <div className="landing-center-badge">
          <img
            src="/assets/logo-oficial-agronorte-white-tight.png"
            alt=""
            draggable={false}
          />
          <p>
            {labels.cultivos.split('\n').map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </p>
        </div>
      </section>

      {/* ═══ BOTTOM BAR: Map + Scroll + Stats ═══ */}
      <section className="landing-bottom">
        {/* Left: Map + country info */}
        <div className="landing-bottom__map">
          <span className="landing-bottom__country">{content.country}</span>
          <p className="landing-bottom__land">
            {labels.land.split('\n').map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </p>
        </div>

        {/* Center: Scroll indicator */}
        <div className="landing-bottom__scroll">
          <span className="landing-bottom__scroll-icon">↓</span>
          <span>{labels.scroll}</span>
        </div>

        {/* Right: Stats + flag + slogan */}
        <div className="landing-bottom__stats-area">
          <div className="landing-bottom__stats-row">
            {content.stats.slice(0, 3).map((stat, i) => (
              <React.Fragment key={stat.id}>
                <span className="landing-bottom__stat-label">{stat.label}</span>
                {i < 2 && <span className="landing-bottom__stat-divider">|</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="landing-bottom__flag-mini">
            <span /><span /><span />
          </div>
          <p className="landing-bottom__from-field">{labels.fromField}</p>
        </div>
      </section>

      {/* ═══ IMPACT / STATS SECTION ═══ */}
      <section className="landing-impact">
        <div className="landing-impact__intro">
          <span className="landing-overline">{content.country}</span>
          <p>
            {content.impactTitle} <em>{content.impactSubtitle}</em>
          </p>
        </div>

        <div className="landing-stats">
          {content.stats.map((stat, i) => {
            const Icon = STAT_ICONS[stat.id] || Lightbulb;
            return (
              <article key={stat.id} className="landing-stat" tabIndex={0}>
                <div className="landing-stat__heading">
                  <span>{String(i + 1).padStart(2, '0')} / {stat.label}</span>
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <strong>{stat.value}</strong>
                <p>{stat.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer">
        <img
          src="/assets/logo-oficial-agronorte-white-tight.png"
          alt="Cooperativa Agronorte"
          draggable={false}
        />
        <p>{content.footerNote}</p>

        <nav className="landing-contacts" aria-label="Contacto">
          {contacts.map((c) =>
            c.href ? (
              <a key={c.id} href={c.href} target="_blank" rel="noopener noreferrer">
                {c.id === 'instagram' && <Globe size={12} />}
                {c.id === 'website' && <Globe size={12} />}
                {c.label}
              </a>
            ) : (
              <span key={c.id}>
                <MapPin size={12} />
                {c.label}
              </span>
            ),
          )}
        </nav>
      </footer>

      {/* ═══ MOBILE CARD (small screens) ═══ */}
      <div className="landing-mobile-card">
        <div className="landing-mobile-card__header">
          <span className="landing-mobile-card__brand">COOP AGRONORTE</span>
          <span className="landing-mobile-card__badge">12+ {lang === 'es-PY' ? 'Invernaderos' : 'Estufas'}</span>
        </div>
        <button
          type="button"
          className="landing-mobile-card__enter"
          onClick={() => onEnter('expert_management')}
        >
          <span>{content.enter.toUpperCase()}</span>
          <ArrowRight size={16} />
        </button>
        <button
          type="button"
          className="landing-mobile-card__producer"
          onClick={() => onEnter('producer_easy')}
        >
          <span>🌾</span>
          <span>{labels.producerMode}</span>
        </button>
      </div>
    </div>
  );
}
