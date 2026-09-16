import type { Language } from '../types';

export type CompactIndicator = {
  id: 'monitoring' | 'cultivation' | 'sustainability';
  label: string;
  detail: string;
};

export type LandingContent = {
  country: string;
  locationLabel: string;
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  enterSystem: string;
  pauseMotion: string;
  resumeMotion: string;
  sceneLabel: string;
  indicators: CompactIndicator[];
  nav: {
    technology: string;
    cultivation: string;
    sustainability: string;
  };
};

export const LANDING_CONTENT: Record<Language, LandingContent> = {
  'pt-BR': {
    country: 'PARAGUAI',
    locationLabel: 'Guayaibí, San Pedro · Paraguai',
    eyebrow: 'TECNOLOGIA PARA QUEM PRODUZ',
    titleLine1: 'Agricultura inteligente,',
    titleLine2: 'raízes paraguaias.',
    description:
      'Controle clima, irrigação e produção em tempo real com tecnologia desenvolvida para quem produz.',
    primaryAction: 'Acessar plataforma',
    secondaryAction: 'Conhecer a tecnologia',
    enterSystem: 'Entrar no sistema',
    pauseMotion: 'Pausar animações',
    resumeMotion: 'Retomar animações',
    sceneLabel:
      'Estufa moderna hidropônica de tomates em Guayaibí, Paraguai, ao amanhecer com bandeira paraguaia e tomateiros no primeiro plano.',
    indicators: [
      {
        id: 'monitoring',
        label: 'Monitoramento em tempo real',
        detail: 'Sensores de clima, pH, EC e VPD em cada estufa',
      },
      {
        id: 'cultivation',
        label: 'Cultivo hidropônico',
        detail: 'Solução nutritiva recirculante com alta precisão',
      },
      {
        id: 'sustainability',
        label: 'Produção sustentável',
        detail: 'Eficiência hídrica, rastreabilidade e protocolo BPA',
      },
    ],
    nav: {
      technology: 'Tecnologia',
      cultivation: 'Cultivo',
      sustainability: 'Sustentabilidade',
    },
  },
  'es-PY': {
    country: 'PARAGUAY',
    locationLabel: 'Guayaibí, San Pedro · Paraguay',
    eyebrow: 'TECNOLOGÍA PARA QUIEN PRODUCE',
    titleLine1: 'Agricultura inteligente,',
    titleLine2: 'raíces paraguayas.',
    description:
      'Control de clima, riego y producción en tiempo real con tecnología desarrollada para quien produce.',
    primaryAction: 'Acceder a la plataforma',
    secondaryAction: 'Conocer la tecnología',
    enterSystem: 'Entrar al sistema',
    pauseMotion: 'Pausar animaciones',
    resumeMotion: 'Reanudar animaciones',
    sceneLabel:
      'Invernadero moderno hidropónico de tomates en Guayaibí, Paraguay, al amanecer con bandera paraguaya y plantas en primer plano.',
    indicators: [
      {
        id: 'monitoring',
        label: 'Monitoreo en tiempo real',
        detail: 'Sensores de microclima, pH, CE y VPD por sector',
      },
      {
        id: 'cultivation',
        label: 'Cultivo hidropónico',
        detail: 'Nutrición recirculante y máxima eficiencia de agua',
      },
      {
        id: 'sustainability',
        label: 'Producción sostenible',
        detail: 'Eficiencia hídrica, trazabilidad y normas BPA SENAVE',
      },
    ],
    nav: {
      technology: 'Tecnología',
      cultivation: 'Cultivo',
      sustainability: 'Sostenibilidad',
    },
  },
};
