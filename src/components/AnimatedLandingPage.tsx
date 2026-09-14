import React, { useEffect, useRef, useState } from 'react';
import { ChartNoAxesCombined, Leaf, Lightbulb, MapPin, Phone, Sprout, Users } from 'lucide-react';
import { Language } from '../types';

const VIDEO_WIDTH = 3840;
const VIDEO_HEIGHT = 2160;
const ENTER_RECT = { x: 1492, y: 1240, width: 816, height: 136 };

// Conteúdo editável da faixa institucional exibida sobre o vídeo.
const HERO_INFO = {
  'es-PY': {
    country: 'PARAGUAY',
    title: 'AGRICULTURA DE PRECISIÓN',
    subtitle: 'PARA UN PARAGUAY MÁS FUERTE',
    stats: [
      { label: 'PLANTAS', value: '12+', detail: 'INVERNADEROS ACTIVOS', icon: Sprout },
      { label: 'PERSONAS', value: '350+', detail: 'FAMILIAS CONECTADAS', icon: Users },
      { label: 'PROGRESO', value: '100%', detail: 'COOPRODUCTIVOS CON EL FUTURO', icon: ChartNoAxesCombined },
      { label: 'INNOVACIÓN', value: '—', detail: 'INVESTIGACIÓN Y DESARROLLO', icon: Lightbulb },
    ],
    location: 'Paraguay',
  },
  'pt-BR': {
    country: 'PARAGUAI',
    title: 'AGRICULTURA DE PRECISÃO',
    subtitle: 'PARA UM PARAGUAI MAIS FORTE',
    stats: [
      { label: 'PLANTAS', value: '12+', detail: 'ESTUFAS ATIVAS', icon: Sprout },
      { label: 'PESSOAS', value: '350+', detail: 'FAMÍLIAS CONECTADAS', icon: Users },
      { label: 'PROGRESSO', value: '100%', detail: 'COOPERADOS COM O FUTURO', icon: ChartNoAxesCombined },
      { label: 'INOVAÇÃO', value: '—', detail: 'PESQUISA E DESENVOLVIMENTO', icon: Lightbulb },
    ],
    location: 'Paraguai',
  },
} as const;

type Props = {
  onEnter: (mode?: 'producer_easy' | 'expert_management') => void;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
};

type ButtonBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function AnimatedLandingPage({ onEnter, lang = 'es-PY', onLanguageChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [buttonBox, setButtonBox] = useState<ButtonBox>({ left: 0, top: 0, width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(true);

  const isEs = lang === 'es-PY';
  const heroInfo = HERO_INFO[lang];

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setMotionEnabled(!media.matches);
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  // Alinhamento geométrico milimétrico do botão interativo sobre o botão no vídeo 4K
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const positionButton = () => {
      const { width, height } = container.getBoundingClientRect();
      const scale = Math.max(width / VIDEO_WIDTH, height / VIDEO_HEIGHT);
      const renderedWidth = VIDEO_WIDTH * scale;
      const renderedHeight = VIDEO_HEIGHT * scale;
      const offsetX = (width - renderedWidth) / 2;
      const offsetY = (height - renderedHeight) / 2;

      setButtonBox({
        left: offsetX + ENTER_RECT.x * scale,
        top: offsetY + ENTER_RECT.y * scale,
        width: ENTER_RECT.width * scale,
        height: ENTER_RECT.height * scale,
      });
    };

    positionButton();
    const observer = new ResizeObserver(positionButton);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="landing-hero" aria-label="Tela inicial do Sistema Coop Agronorte">
      {/* Imagem estática de fallback */}
      <img
        src="/assets/agronorte-scenic-daylight.jpg"
        alt="Estufas hidropônicas da Cooperativa Agronorte em Guayaibí, Paraguai"
        className="landing-hero__fallback"
      />

      {/* Vídeo 4K UHD Original do Usuário */}
      <video
        ref={videoRef}
        className={`landing-hero__video ${motionEnabled ? 'is-ready' : ''}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/assets/agronorte-scenic-daylight.jpg"
        onLoadedData={() => setIsReady(true)}
        aria-hidden="true"
      >
        <source src="/assets/video-home.mp4" type="video/mp4" />
      </video>

      {/* Botão Interativo Principal sobreposto com precisão sobre o botão do vídeo */}
      <button
        type="button"
        onClick={() => onEnter('expert_management')}
        style={{
          position: 'absolute',
          left: `${buttonBox.left}px`,
          top: `${buttonBox.top}px`,
          width: `${buttonBox.width}px`,
          height: `${buttonBox.height}px`,
          zIndex: 15,
        }}
        className="group rounded-full cursor-pointer transition-all duration-200 border-2 border-transparent hover:border-emerald-300 hover:shadow-[0_0_35px_rgba(16,185,129,0.75)] hover:bg-emerald-500/10 active:scale-[0.99] focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-4"
        title={isEs ? 'Entrar al Sistema Coop Agronorte' : 'Entrar no Sistema Coop Agronorte'}
        aria-label={isEs ? 'Entrar al Sistema Coop Agronorte' : 'Entrar no Sistema Coop Agronorte'}
      >
        <span className="sr-only">{isEs ? 'Entrar al Sistema' : 'Entrar no Sistema'}</span>
      </button>

      {/* Faixa recriada em HTML: cobre as informações gravadas no vídeo e permite editá-las. */}
      <section className="absolute inset-x-0 bottom-0 z-10 hidden h-[26%] min-h-[168px] sm:flex border-t border-emerald-500/35 bg-[linear-gradient(100deg,rgba(3,25,23,0.99),rgba(4,31,28,0.98))] text-white shadow-[0_-14px_38px_rgba(0,0,0,0.28)]">
        <div className="flex w-[43%] min-w-0 flex-col justify-center border-r border-white/10 px-8 lg:px-14">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-lime-400 lg:text-xs">
            <Leaf className="h-3.5 w-3.5" />
            <span>{heroInfo.country}</span>
          </div>
          <h1 className="mt-1 max-w-xl text-2xl font-black leading-[0.98] tracking-wide lg:text-4xl">
            {heroInfo.title}
          </h1>
          <p className="mt-2 text-[10px] font-bold tracking-[0.12em] text-lime-400 lg:text-sm">
            {heroInfo.subtitle}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[9px] text-white/65 lg:text-[10px]">
            <span>@coopagronorte</span>
            <span>@agronorte_py</span>
            <span>www.agronorte.com.py</span>
          </div>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-4">
          {heroInfo.stats.map(({ label, value, detail, icon: Icon }) => (
            <article key={label} className="flex min-w-0 flex-col items-center justify-center border-r border-white/10 px-2 text-center last:border-r-0">
              <span className="text-[10px] font-bold tracking-widest text-white/80 lg:text-xs">{label}</span>
              <Icon className="my-1 h-6 w-6 text-lime-400 lg:h-8 lg:w-8" strokeWidth={1.7} />
              <strong className="text-xl leading-none lg:text-3xl">{value}</strong>
              <span className="mt-1 max-w-[130px] text-[8px] font-semibold leading-tight text-white/70 lg:text-[10px]">{detail}</span>
            </article>
          ))}
        </div>

        <div className="absolute bottom-2 right-4 flex items-center gap-4 text-[8px] text-white/55 lg:text-[10px]">
          <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-lime-400" /> +595 21 729 455</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-lime-400" /> {heroInfo.location}</span>
        </div>
      </section>

      {/* Botão de Atalho Rápido para o Modo Produtor logo abaixo */}
      <div
        style={{
          position: 'absolute',
          left: `${buttonBox.left + buttonBox.width * 0.5}px`,
          top: `${buttonBox.top + buttonBox.height + 62}px`,
          transform: 'translateX(-50%)',
          zIndex: 16,
        }}
        className="hidden md:flex items-center"
      >
        <button
          type="button"
          onClick={() => onEnter('producer_easy')}
          className="px-4 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-emerald-300 hover:text-white font-bold text-xs tracking-wide border border-emerald-500/40 hover:border-emerald-400 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5 shadow-lg"
          title="Acessar com o avatar Don Mateo"
        >
          <span>🌾</span>
          <span>{isEs ? 'Modo Fácil Produtor (Don Mateo IA)' : 'Modo Fácil Produtor (Don Mateo IA)'}</span>
        </button>
      </div>

      {/* Controles Flutuantes Superiores (Idioma e Status) */}
      <header className="absolute top-4 right-4 sm:top-6 sm:right-8 z-20 flex items-center gap-3">
        {/* Telemetria IoT Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isEs ? '12+ Invernaderos Activos • Telemetría 24/7' : '12+ Estufas Ativas • Telemetria 24/7'}</span>
        </div>

        {/* Seletor Bilíngue */}
        {onLanguageChange && (
          <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-black/50 backdrop-blur-md border border-white/25 text-xs font-bold text-white shadow-md">
            <button
              type="button"
              onClick={() => onLanguageChange('es-PY')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                lang === 'es-PY' ? 'bg-emerald-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title="Español (Paraguay)"
            >
              🇵🇾 ES
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('pt-BR')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                lang === 'pt-BR' ? 'bg-emerald-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title="Português (Brasil)"
            >
              🇧🇷 PT
            </button>
          </div>
        )}
      </header>

      {/* Cartão Responsivo de Acesso Seguro para Celulares (onde a proporção 16:9 corta laterais) */}
      <div className="sm:hidden absolute inset-x-3 bottom-3 z-20 bg-black/85 backdrop-blur-lg p-4 rounded-2xl border border-emerald-500/40 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white">COOP AGRONORTE</span>
            <span className="text-[10px] text-emerald-400 font-bold">12+ ESTUFAS</span>
          </div>
          <span className="text-[10px] text-white/70">350+ Famílias</span>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onEnter('expert_management')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
          >
            <span>{isEs ? 'ENTRAR AL SISTEMA' : 'ENTRAR NO SISTEMA'}</span>
            <span>→</span>
          </button>
          <button
            type="button"
            onClick={() => onEnter('producer_easy')}
            className="w-full py-2.5 rounded-xl bg-white/10 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <span>🌾</span>
            <span>{isEs ? 'Modo Fácil Produtor (Don Mateo)' : 'Modo Fácil Produtor (Don Mateo)'}</span>
          </button>
        </div>
      </div>

      {/* Indicador de carregamento suave */}
      {!isReady && (
        <div className="landing-hero__loading" aria-live="polite">
          {isEs ? 'Iniciando video de alta definición…' : 'Iniciando vídeo de alta definição…'}
        </div>
      )}
    </div>
  );
}
