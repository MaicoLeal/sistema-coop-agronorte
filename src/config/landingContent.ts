import type { Language } from '../types';

type LandingStat = {
  id: 'plants' | 'people' | 'progress' | 'innovation';
  label: string;
  value: string;
  detail: string;
};

type LandingFeature = {
  id: 'cultivation' | 'telemetry' | 'traceability' | 'sustainability';
  label: string;
  detail: string;
};

type LandingContent = {
  country: string;
  locationLabel: string;
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  description: string;
  enter: string;
  producer: string;
  pauseMotion: string;
  resumeMotion: string;
  sceneLabel: string;
  footerNote: string;
  impactTitle: string;
  impactSubtitle: string;
  impactLabel: string;
  stats: LandingStat[];
  features: LandingFeature[];
};

// Edite os textos e indicadores da página inicial aqui, em cada idioma.
export const LANDING_CONTENT = {
  'es-PY': {
    country: 'PARAGUAY',
    locationLabel: 'Guayaibí, Paraguay',
    eyebrow: 'COOPERATIVA AGRONORTE · CULTIVAMOS JUNTOS',
    titleLine1: 'AGRICULTURA DE',
    titleLine2: 'PRECISIÓN',
    subtitle: 'PARA UN PARAGUAY MÁS FUERTE',
    description:
      'Cultivo hidropónico, trazabilidad y tecnología que conectan a las familias de nuestra cooperativa.',
    enter: 'Entrar al sistema',
    producer: 'Modo Fácil Productor · Don Mateo IA',
    pauseMotion: 'Pausar animaciones',
    resumeMotion: 'Reanudar animaciones',
    sceneLabel:
      'Amanecer sobre los cultivos, con la bandera paraguaya y las plantas moviéndose suavemente con el viento.',
    footerNote: 'Tecnología que produce un mejor mañana.',
    impactTitle: 'Crecemos juntos.',
    impactSubtitle: 'Cultivamos el mañana.',
    impactLabel: 'Nuestra cooperativa en números',
    stats: [
      { id: 'plants', label: 'PLANTAS', value: '12+', detail: 'INVERNADEROS ACTIVOS' },
      { id: 'people', label: 'PERSONAS', value: '350+', detail: 'FAMILIAS CONECTADAS' },
      { id: 'progress', label: 'PROGRESO', value: '100%', detail: 'COOPRODUCTIVOS CON EL FUTURO' },
      { id: 'innovation', label: 'INNOVACIÓN', value: '—', detail: 'INVESTIGACIÓN Y DESARROLLO' },
    ],
    features: [
      { id: 'cultivation', label: 'Cultivo hidropónico', detail: 'Cuidado de cada planta' },
      { id: 'telemetry', label: 'Telemetría', detail: 'Seguimiento del microclima' },
      { id: 'traceability', label: 'Trazabilidad', detail: 'Del cultivo a la cosecha' },
      { id: 'sustainability', label: 'Producción sostenible', detail: 'Eficiencia, cuidado y futuro para Paraguay' },
    ],
  },
  'pt-BR': {
    country: 'PARAGUAI',
    locationLabel: 'Guayaibí, Paraguai',
    eyebrow: 'COOPERATIVA AGRONORTE · CULTIVAMOS JUNTOS',
    titleLine1: 'AGRICULTURA DE',
    titleLine2: 'PRECISÃO',
    subtitle: 'PARA UM PARAGUAI MAIS FORTE',
    description:
      'Cultivo hidropônico, rastreabilidade e tecnologia que conectam as famílias da nossa cooperativa.',
    enter: 'Entrar no sistema',
    producer: 'Modo Fácil Produtor · Don Mateo IA',
    pauseMotion: 'Pausar animações',
    resumeMotion: 'Retomar animações',
    sceneLabel:
      'Amanhecer sobre os cultivos, com a bandeira paraguaia e as plantas se movendo suavemente com o vento.',
    footerNote: 'Tecnologia que produz um amanhã melhor.',
    impactTitle: 'Crescemos juntos.',
    impactSubtitle: 'Cultivamos o amanhã.',
    impactLabel: 'Nossa cooperativa em números',
    stats: [
      { id: 'plants', label: 'PLANTAS', value: '12+', detail: 'ESTUFAS ATIVAS' },
      { id: 'people', label: 'PESSOAS', value: '350+', detail: 'FAMÍLIAS CONECTADAS' },
      { id: 'progress', label: 'PROGRESSO', value: '100%', detail: 'COOPERADOS COM O FUTURO' },
      { id: 'innovation', label: 'INOVAÇÃO', value: '—', detail: 'PESQUISA E DESENVOLVIMENTO' },
    ],
    features: [
      { id: 'cultivation', label: 'Cultivo hidropônico', detail: 'Cuidado com cada planta' },
      { id: 'telemetry', label: 'Telemetria', detail: 'Acompanhamento do microclima' },
      { id: 'traceability', label: 'Rastreabilidade', detail: 'Do cultivo à colheita' },
      { id: 'sustainability', label: 'Produção sustentável', detail: 'Eficiência, cuidado e futuro para o Paraguai' },
    ],
  },
} satisfies Record<Language, LandingContent>;

// Contatos já utilizados na página da cooperativa.
export const LANDING_CONTACTS: {
  id: 'instagram' | 'website' | 'location';
  label: string;
  href?: string;
}[] = [
  { id: 'instagram', label: '@agronorte_py', href: 'https://www.instagram.com/agronorte_py/' },
  { id: 'website', label: 'www.agronorte.com.py', href: 'https://www.agronorte.com.py' },
  { id: 'location', label: 'Paraguay' },
];
