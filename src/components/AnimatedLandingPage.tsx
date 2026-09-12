import React from 'react';
import { Language } from '../types';
import { LANDING_CONTENT } from '../config/landingContent';
import LandingScene from './LandingScene';
import './AnimatedLandingPage.css';

type Props = {
  onEnter: (mode?: 'producer_easy' | 'expert_management') => void;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
};

/**
 * Full-bleed visual landing based on the reference artwork. The transparent
 * desktop action follows the button drawn in the artwork; mobile gets a real
 * labeled action because the reference frame is cropped on narrow screens.
 */
export function AnimatedLandingPage({ onEnter, lang = 'es-PY' }: Props) {
  const content = LANDING_CONTENT[lang];

  return (
    <div className="agronorte-landing agronorte-landing--visual-only" lang={lang}>
      <section className="landing-stage landing-stage--visual-only" aria-label={content.sceneLabel}>
        <LandingScene active />
        <h1 className="landing-visual-title">{content.titleLine1} {content.titleLine2}</h1>
        <button
          type="button"
          className="landing-reference-entry"
          onClick={() => onEnter('expert_management')}
          aria-label={content.enter}
          title={content.enter}
        >
          <span className="landing-reference-entry__label">{content.enter}</span>
        </button>
      </section>
    </div>
  );
}
