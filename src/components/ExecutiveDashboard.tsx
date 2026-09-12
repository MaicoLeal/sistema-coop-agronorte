import React, { useState } from 'react';
import {
  Language,
  PlantBatch,
  Alert,
  HarvestRecord,
  PackLot,
  Shipment,
  ProductionZone
} from '../types';
import { translations } from '../i18n/translations';
import { AIDiagnosisService } from '../services/aiDiagnosisService';
import {
  FileText,
  Cloud,
  FlaskConical,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ShieldCheck,
  CheckCircle2,
  Info,
  ChevronRight,
  Droplets,
  Sliders,
  Brain,
  Handshake,
  CalendarCheck,
  Sparkles,
  Bug,
  Volume2,
  AlertTriangle
} from 'lucide-react';

interface ExecutiveDashboardProps {
  lang: Language;
  zones: ProductionZone[];
  batches: PlantBatch[];
  alerts: Alert[];
  harvests: HarvestRecord[];
  packLots: PackLot[];
  shipments: Shipment[];
  onNavigate: (tab: string) => void;
  onOpenVersionModal?: () => void;
  onOpenPestDiagnosis?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  lang,
  zones,
  batches,
  alerts,
  harvests,
  packLots,
  shipments,
  onNavigate,
  onOpenVersionModal,
  onOpenPestDiagnosis
}) => {
  const t = translations[lang];
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [isPlayingAdvisoryAudio, setIsPlayingAdvisoryAudio] = useState<boolean>(false);
  const [advisorySpeechLang, setAdvisorySpeechLang] = useState<'PT' | 'ES'>(lang === 'pt-BR' ? 'PT' : 'ES');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quarantine batches check
  const quarantinedBatches = batches.filter((b) => b.isBlocked);

  const handleApplyDosage = () => {
    setToastMessage('Ajuste de injeção de Cálcio no Tanque A (+8%) enviado ao CLP com sucesso.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePlayAdvisoryAudio = (targetLang: 'PT' | 'ES') => {
    setAdvisorySpeechLang(targetLang);
    const script =
      targetLang === 'PT'
        ? 'Parecer agronômico automatizado da Cooperativa Agronorte. Previsão de elevação térmica e queda na umidade relativa amanhã à tarde, com déficit de pressão de vapor estimado em um vírgula quatro kilopascals. Recomenda-se aumentar a proporção de cálcio solúvel no Tanque A em oito por cento para mitigar riscos de podridão apical nos cachos de tomate grape em rápido enchimento.'
        : 'Dictamen agronómico automatizado de la Cooperativa Agronorte. Pronóstico de aumento térmico y caída de humedad relativa mañana por la tarde, con déficit de presión de vapor estimado en uno coma cuatro kilopascales. Se recomienda incrementar la proporción de calcio soluble en el Tanque A en un ocho por ciento para mitigar la pudrición apical en los racimos de tomate en llenado.';

    setIsPlayingAdvisoryAudio(true);
    AIDiagnosisService.playAudioSolution(
      script,
      targetLang,
      () => setIsPlayingAdvisoryAudio(true),
      () => setIsPlayingAdvisoryAudio(false)
    );
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Toast feedback if any action triggered */}
      {toastMessage && (
        <div className="bg-primary text-on-primary p-3.5 rounded-xl shadow-md flex items-center justify-between text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-on-primary-container" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-on-primary opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Critical quarantine banner if applicable */}
      {quarantinedBatches.length > 0 && (
        <div className="bg-error-container border border-error/30 text-on-error-container rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-error text-on-error flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                {t.batchQuarantineAlert}
              </h4>
              <p className="text-xs mt-0.5">
                Lote retido preventivamente:{' '}
                <strong className="font-mono">{quarantinedBatches.map((b) => b.batchCode).join(', ')}</strong>.
                Expedições bloqueadas até revalidação do SENAVE.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('batches')}
            className="text-xs font-semibold bg-error text-on-error px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90 shrink-0 cursor-pointer"
          >
            Auditar Lote Retido
          </button>
        </div>
      )}

      {/* Operational Overview Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              OPERACIONAL NOMINAL
            </span>
            <span className="text-xs font-mono text-on-surface-variant font-medium">
              Safra de Inverno 2025 • Semana 14
            </span>
            <span className="text-outline-variant text-xs">•</span>
            <span className="text-xs font-mono text-primary font-bold">
              Cooperativa Agronorte (SENAVE Nº 441/2024)
            </span>
          </div>

          <h1 className="font-display text-2xl lg:text-3xl text-on-surface font-bold tracking-tight mt-1">
            Painel Central de Manejo Hidropônico
          </h1>

          <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            Monitoramento telemétrico e automação de fertirrigação para estufas de alta tecnologia.
            Otimização em tempo real de cultivares de Tomate (Grape & Italiano) e Pimentões de alta performance.
          </p>
        </div>

        {/* Quick Actions Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('compliance')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-all shadow-xs cursor-pointer"
            type="button"
          >
            <FileText className="w-4 h-4 text-on-surface-variant" />
            <span>Boletim Técnico</span>
          </button>

          <button
            onClick={() => onNavigate('agronomic')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-semibold text-xs transition-all shadow-xs cursor-pointer"
            type="button"
          >
            <Cloud className="w-4 h-4 text-secondary" />
            <span>Modo Nebulização</span>
          </button>

          {onOpenPestDiagnosis && (
            <button
              onClick={onOpenPestDiagnosis}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container font-semibold text-xs shadow-xs transition-all cursor-pointer group"
              type="button"
            >
              <Bug className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
              <span>Diagnóstico IA (Foto/Áudio)</span>
            </button>
          )}

          <button
            onClick={handleApplyDosage}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Dosagem Nutrientes</span>
          </button>
        </div>
      </div>

      {/* Cultivar Quick Filter Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCropFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCropFilter === 'all'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
          }`}
        >
          Todas as Culturas (4 Ativas)
        </button>

        <button
          onClick={() => setSelectedCropFilter('tomate_grape')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCropFilter === 'tomate_grape'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
          }`}
        >
          🍅 Tomate Grape (Bloco A1)
        </button>

        <button
          onClick={() => setSelectedCropFilter('tomate_italiano')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCropFilter === 'tomate_italiano'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
          }`}
        >
          🍅 Tomate Italiano (Bloco A2)
        </button>

        <button
          onClick={() => setSelectedCropFilter('pimentao_amarelo')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCropFilter === 'pimentao_amarelo'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
          }`}
        >
          🫑 Pimentão Amarelo Blocky (Bloco B1)
        </button>

        <button
          onClick={() => setSelectedCropFilter('pimentao_vermelho')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCropFilter === 'pimentao_vermelho'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
          }`}
        >
          🫑 Pimentão Magno Vermelho (Bloco B2)
        </button>
      </div>

      {/* 4 Pilares da Cooperativa Agronorte (Dados Oficiais do Vídeo) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-3.5 shadow-xs border border-primary/20">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl shrink-0">
            🌱
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-on-surface">12+</span>
            </div>
            <span className="text-xs font-bold text-primary block leading-tight uppercase tracking-wider">
              {lang === 'pt-BR' ? 'Estufas Ativas' : 'Invernaderos Activos'}
            </span>
            <span className="text-[10px] text-on-surface-variant">
              Guayaibí • San Pedro
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-3.5 shadow-xs border border-secondary/20">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-2xl shrink-0">
            👨‍👩‍👧‍👦
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-on-surface">350+</span>
            </div>
            <span className="text-xs font-bold text-secondary block leading-tight uppercase tracking-wider">
              {lang === 'pt-BR' ? 'Famílias Conectadas' : 'Familias Conectadas'}
            </span>
            <span className="text-[10px] text-on-surface-variant">
              Produtores Cooperados
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-3.5 shadow-xs border border-emerald-500/20">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
            🛡️
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-on-surface">100%</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 block leading-tight uppercase tracking-wider">
              {lang === 'pt-BR' ? 'Compromisso com o Futuro' : 'Comprometidos con el Futuro'}
            </span>
            <span className="text-[10px] text-on-surface-variant">
              SENAVE • BPA • GS1
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-3.5 shadow-xs border border-primary/20">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center text-2xl shrink-0">
            🔬
          </div>
          <div>
            <span className="text-sm font-black font-mono text-on-surface block leading-tight">
              I+D Agronorte
            </span>
            <span className="text-xs font-bold text-primary block leading-tight uppercase tracking-wider">
              {lang === 'pt-BR' ? 'Pesquisa e Inovação' : 'Investigación y Desarrollo'}
            </span>
            <span className="text-[10px] text-on-surface-variant">
              Manejo Biológico & IoT
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry Sensor Grid (5 High-Density KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5">

        {/* KPI 1: EC */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-outline-variant/30 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-outline uppercase tracking-wider font-semibold">
                Nutrição / Solução
              </span>
              <span className="text-sm font-bold text-on-surface">Condutividade (EC)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[11px] font-bold">
              Alvo 2.2 - 2.6
            </span>
          </div>

          <div className="my-2.5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold text-on-surface">2.45</span>
              <span className="text-xs font-mono text-on-surface-variant font-medium">mS/cm</span>
            </div>
            <div className="flex items-center text-primary font-mono text-xs font-semibold">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>+0.04</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden flex">
              <div className="bg-secondary-fixed-dim h-full w-[25%]"></div>
              <div className="bg-primary h-full w-[50%]"></div>
              <div className="bg-tertiary-fixed-dim h-full w-[25%]"></div>
            </div>
            <span className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
              Ideal para Frutificação Tomates
            </span>
          </div>
        </div>

        {/* KPI 2: pH */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-outline-variant/30 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-outline uppercase tracking-wider font-semibold">
                Equilíbrio Iônico
              </span>
              <span className="text-sm font-bold text-on-surface">Potencial Hidrogênio</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[11px] font-bold">
              Alvo 5.6 - 6.2
            </span>
          </div>

          <div className="my-2.5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold text-on-surface">5.82</span>
              <span className="text-xs font-mono text-on-surface-variant font-medium">pH</span>
            </div>
            <div className="flex items-center text-primary font-mono text-xs font-semibold">
              <ArrowDown className="w-3.5 h-3.5" />
              <span>-0.08</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden flex">
              <div className="bg-tertiary-fixed-dim h-full w-[20%]"></div>
              <div className="bg-primary h-full w-[60%]"></div>
              <div className="bg-secondary-fixed-dim h-full w-[20%]"></div>
            </div>
            <span className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Injeção de HNO₃ Estável
            </span>
          </div>
        </div>

        {/* KPI 3: VPD / Temp */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-outline-variant/30 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-outline uppercase tracking-wider font-semibold">
                Transpiração Foliar
              </span>
              <span className="text-sm font-bold text-on-surface">Déficit Pressão (DPV)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-secondary font-mono text-[11px] font-bold">
              0.9 - 1.3 kPa
            </span>
          </div>

          <div className="my-2.5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold text-secondary">1.15</span>
              <span className="text-xs font-mono text-on-surface-variant font-medium">kPa</span>
            </div>
            <div className="text-right text-[11px] font-mono text-on-surface-variant">
              Solução 21.4°C
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div className="bg-secondary-container h-full w-[65%]"></div>
            </div>
            <span className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
              Ambiente 26.8°C • Ventilação On
            </span>
          </div>
        </div>

        {/* KPI 4: Dissolved Oxygen */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-outline-variant/30 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-outline uppercase tracking-wider font-semibold">
                Respiração Radicular
              </span>
              <span className="text-sm font-bold text-on-surface">Oxigênio Dissolvido</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[11px] font-bold">
              &gt; 6.5 mg/L
            </span>
          </div>

          <div className="my-2.5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold text-on-surface">7.9</span>
              <span className="text-xs font-mono text-on-surface-variant font-medium">mg/L</span>
            </div>
            <div className="flex items-center text-primary font-mono text-xs font-semibold">
              <ArrowUp className="w-3.5 h-3.5" />
              <span>+0.3</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full w-[88%]"></div>
            </div>
            <span className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
              Venturis a 100% no Tanque
            </span>
          </div>
        </div>

        {/* KPI 5: Relative Humidity */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-outline-variant/30 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-outline uppercase tracking-wider font-semibold">
                Microclima Foliar
              </span>
              <span className="text-sm font-bold text-on-surface">Umidade Relativa</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-[11px] font-bold">
              Faixa 60-75%
            </span>
          </div>

          <div className="my-2.5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold text-on-surface">68</span>
              <span className="text-xs font-mono text-on-surface-variant font-medium">%</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-mono text-[10px] font-bold">
              Exaustores 60%
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div className="bg-secondary-fixed-dim h-full w-[68%]"></div>
            </div>
            <span className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
              Telas Termorrefletoras 45%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Crop Sectors & Detailed Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Sector A (Tomates) and Sector B (Pimentões) + Trend Chart (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Sector Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
                <Cloud className="w-4 h-4 text-on-primary-container" />
              </div>
              <h2 className="font-display text-lg text-on-surface font-bold">
                Cultivos Monitorados em Tempo Real
              </h2>
            </div>
            <span className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">
              Drenagem &amp; Consumo Hídrico
            </span>
          </div>

          {/* Sector Cards 2-Col Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sector A Card: Tomates */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-mono text-[10px] font-bold">
                        Setor A • Calhas NFT
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-[10px] font-bold">
                        DAP: 62 dias
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-on-surface">
                      Tomate Grape &amp; Sweet
                    </h3>
                    <span className="text-xs text-on-surface-variant">
                      Estágio: Enchimento e Frutificação Intensa
                    </span>
                  </div>

                  <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl shadow-xs shrink-0">
                    🍅
                  </div>
                </div>

                {/* Parameters Grid */}
                <div className="grid grid-cols-2 gap-2 bg-surface-container-low rounded-xl p-3 mb-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase block font-semibold">
                      EC Alvo / Atual
                    </span>
                    <span className="font-mono text-sm text-on-surface font-bold">
                      2.60 <span className="text-xs font-normal text-on-surface-variant">/ 2.58</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase block font-semibold">
                      Consumo Diário
                    </span>
                    <span className="font-mono text-sm text-primary font-bold">
                      1.850 L<span className="text-xs font-normal text-on-surface-variant">/estufa</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase block font-semibold">
                      Radiação PAR Acum.
                    </span>
                    <span className="font-mono text-sm text-on-surface font-bold">
                      820 <span className="text-xs font-normal text-on-surface-variant">µmol/m²/s</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase block font-semibold">
                      Drenagem de Calha
                    </span>
                    <span className="font-mono text-sm text-secondary font-bold">
                      22% <span className="text-xs font-normal text-on-surface-variant">(20-25%)</span>
                    </span>
                  </div>
                </div>

                {/* Notice Pill */}
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-high text-on-surface-variant text-xs">
                  <Info className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>Ajuste fino de recirculação programado no Bloco 03 (Calha 12).</span>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between border-t border-outline-variant/20">
                <span className="text-xs font-mono text-on-surface-variant">Bancadas: 24/24 Ativas</span>
                <button
                  onClick={() => onNavigate('batches')}
                  className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Detalhes do Setor</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sector B Card: Pimentões */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-mono text-[10px] font-bold">
                        Setor B • Substrato Slab
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-[10px] font-bold">
                        DAP: 48 dias
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-on-surface">
                      Pimentão Amarelo &amp; Magno
                    </h3>
                    <span className="text-xs text-on-surface-variant">
                      Estágio: Floração &amp; Pegamento Inicial de Frutos
                    </span>
                  </div>

                  <div className="w-14 h-14 rounded-xl bg-lime-100 flex items-center justify-center text-2xl shadow-xs shrink-0">
                    🫑
                  </div>
                </div>

                {/* Parameters Grid */}
                <div className="grid grid-cols-2 gap-2 bg-surface-container-low rounded-xl p-3 mb-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase block font-semibold">
                      EC Alvo / Atual
                    </span>
                    <span className="font-mono text-sm text-on-surface font-bold">
                      2.10 <span className="text-xs font-normal text-on-surface-variant">/ 2.12</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase block font-semibold">
                      Consumo Diário
                    </span>
                    <span className="font-mono text-sm text-primary font-bold">
                      1.420 L<span className="text-xs font-normal text-on-surface-variant">/estufa</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase block font-semibold">
                      Relação K : Ca : Mg
                    </span>
                    <span className="font-mono text-sm text-on-surface font-bold">
                      1.2 : 1.0 : 0.4
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase block font-semibold">
                      Necrose Apical
                    </span>
                    <span className="font-mono text-sm text-primary font-bold">
                      0.0% <span className="text-xs font-normal text-on-surface-variant">(Prevenção OK)</span>
                    </span>
                  </div>
                </div>

                {/* Status Notice Pill */}
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-high text-on-surface-variant text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Armadilhas cromotrópicas digitais ativas: 100% isento de pragas.</span>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between border-t border-outline-variant/20">
                <span className="text-xs font-mono text-on-surface-variant">Bancadas: 18/18 Ativas</span>
                <button
                  onClick={() => onNavigate('batches')}
                  className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Detalhes do Setor</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Fertigation & 24h Trend Chart Container */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-outline-variant/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-display text-base font-bold text-on-surface">
                  Curva de Fertirrigação &amp; Estabilidade da Solução
                </h3>
                <span className="text-xs text-on-surface-variant">
                  Registro dinâmico de Condutividade Elétrica (EC) e pH nas últimas 24 horas
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
                  <span className="font-mono text-[11px] text-on-surface-variant">EC (mS/cm)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-secondary inline-block"></span>
                  <span className="font-mono text-[11px] text-on-surface-variant">pH Solução</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-secondary-container inline-block"></span>
                  <span className="font-mono text-[11px] text-on-surface-variant">Injeções</span>
                </div>
              </div>
            </div>

            {/* Inline Telemetry SVG Chart */}
            <div className="w-full h-56 relative bg-surface-container-low rounded-xl p-3 overflow-hidden flex flex-col justify-between border border-outline-variant/20">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 180">
                {/* Grid Lines */}
                <line stroke="#c0c9ba" strokeDasharray="4" strokeWidth="1" x1="0" x2="800" y1="36" y2="36" opacity="0.6" />
                <line stroke="#c0c9ba" strokeDasharray="4" strokeWidth="1" x1="0" x2="800" y1="90" y2="90" opacity="0.6" />
                <line stroke="#c0c9ba" strokeDasharray="4" strokeWidth="1" x1="0" x2="800" y1="144" y2="144" opacity="0.6" />

                {/* Fertigation Event Columns */}
                <rect fill="#c5f272" height="135" opacity="0.45" rx="3" width="18" x="120" y="20" />
                <rect fill="#c5f272" height="135" opacity="0.45" rx="3" width="18" x="290" y="20" />
                <rect fill="#c5f272" height="135" opacity="0.45" rx="3" width="18" x="460" y="20" />
                <rect fill="#c5f272" height="135" opacity="0.45" rx="3" width="18" x="630" y="20" />

                {/* EC Target Band (Area Gradient) */}
                <defs>
                  <linearGradient id="ecGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1f6d24" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#1f6d24" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0,105 Q100,100 180,95 T360,98 T540,92 T720,95 L800,94 L800,160 L0,160 Z" fill="url(#ecGrad)" />

                {/* EC Curve (Primary Green) */}
                <path d="M0,105 Q100,100 180,95 T360,98 T540,92 T720,95 L800,94" fill="none" stroke="#005410" strokeLinecap="round" strokeWidth="3" />

                {/* pH Curve (Secondary Olive) */}
                <path d="M0,65 Q110,68 200,64 T380,66 T560,62 T730,65 L800,63" fill="none" stroke="#486800" strokeDasharray="4,3" strokeLinecap="round" strokeWidth="2.5" />

                {/* Active Sensor Dot on EC */}
                <circle cx="800" cy="94" fill="#005410" r="5" />
                <circle cx="800" cy="94" fill="#005410" opacity="0.25" r="10" />
              </svg>

              {/* Timeline Labels */}
              <div className="flex justify-between items-center px-1 text-on-surface-variant font-mono text-[11px] pt-1">
                <span>00:00 (Noite)</span>
                <span>04:00</span>
                <span>08:00 (Sol Nascente)</span>
                <span>12:00 (Pico PAR)</span>
                <span>16:00 (Injeção Tarde)</span>
                <span className="font-bold text-primary">Agora (20:00)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 text-on-surface-variant text-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>4 ciclos de irrigação executados hoje sem desvio da curva ótima.</span>
              </div>
              <span className="font-mono text-[11px] text-outline">
                Próximo ciclo programado: 21:15 (Regime Noturno - 8 min)
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Tanks, Stock Solutions, Actuators & Climatization (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Reservatórios de Solução Mãe */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-primary" />
                <h3 className="font-display text-base font-bold text-on-surface">
                  Tanques de Solução Mãe
                </h3>
              </div>
              <span className="text-[11px] font-mono text-on-surface-variant font-semibold">
                Balanço Químico
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Tanque A */}
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-on-surface font-bold block">
                      Tanque A • Nitrato de Cálcio + Fe
                    </span>
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      Quelato Fe-EDDHA 6%
                    </span>
                  </div>
                  <span className="font-mono text-sm text-primary font-bold">84%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '84%' }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>Autonomia: ~18 dias</span>
                  <button onClick={handleApplyDosage} className="text-primary hover:underline font-bold cursor-pointer">
                    Reabastecer
                  </button>
                </div>
              </div>

              {/* Tanque B */}
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-on-surface font-bold block">
                      Tanque B • NPK + Sulfato de Magnésio
                    </span>
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      Fórmula Fértil Floração Cooperativa
                    </span>
                  </div>
                  <span className="font-mono text-sm text-primary font-bold">76%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '76%' }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>Autonomia: ~14 dias</span>
                  <button onClick={handleApplyDosage} className="text-primary hover:underline font-bold cursor-pointer">
                    Reabastecer
                  </button>
                </div>
              </div>

              {/* Tanque C */}
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-on-surface font-bold block">
                      Tanque C • Ácido Nítrico (pH Down)
                    </span>
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      Concentração a 10% de dosagem
                    </span>
                  </div>
                  <span className="font-mono text-sm text-secondary font-bold">92%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>Autonomia: ~35 dias</span>
                  <button onClick={handleApplyDosage} className="text-secondary hover:underline font-bold cursor-pointer">
                    Reabastecer
                  </button>
                </div>
              </div>

              {/* Tanque D */}
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-on-surface font-bold block">
                      Tanque D • Água Filtrada Osmose
                    </span>
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      Capacidade 15.000 L
                    </span>
                  </div>
                  <span className="font-mono text-sm text-on-surface font-bold">65%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-secondary-fixed-dim h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>Fluxo: 24 L/min</span>
                  <button onClick={handleApplyDosage} className="text-primary hover:underline font-bold cursor-pointer">
                    Bombear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Painel de Atuadores & Climatização */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-secondary" />
                <h3 className="font-display text-base font-bold text-on-surface">
                  Atuadores &amp; Climatização
                </h3>
              </div>
              <span className="text-[11px] font-mono text-secondary font-bold">
                Modo Automático
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                  <div>
                    <span className="text-xs text-on-surface font-semibold block">
                      Válvula Principal Solenoide 01
                    </span>
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      Ciclo: 15 min ON / 10 min OFF
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-secondary-container text-on-secondary-container font-mono text-[10px] font-bold">
                  ABERTA
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                  <div>
                    <span className="text-xs text-on-surface font-semibold block">
                      Cortinas &amp; Pad Cooling
                    </span>
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      Controle térmico &lt; 27°C
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-secondary-container text-on-secondary-container font-mono text-[10px] font-bold">
                  ATIVO (40%)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-outline-variant inline-block"></span>
                  <div>
                    <span className="text-xs text-on-surface font-semibold block">
                      LED Suplementar Agro
                    </span>
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      Desligado por radiação solar suficiente
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface-variant font-mono text-[10px] font-bold">
                  STANDBY
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel: Agronomic Advisory & Cooperative Field Visits */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Agronomic Technical Recommendation with Audio Option */}
        <div className="xl:col-span-8 bg-surface-container-low rounded-2xl p-5 flex flex-col md:flex-row items-start gap-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-outline-variant/30">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-sm">
            <Brain className="w-6 h-6" />
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[10px] font-bold uppercase tracking-wide">
                Parecer Agronômico Automatizado
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant">
                Emitido às 18:30 • Algoritmo de Nutrição Agronorte
              </span>
            </div>

            <h4 className="font-display text-base font-bold text-on-surface">
              Recomendação de Correção: Aumento de 8% no Cálcio Solúvel (Setor Tomate)
            </h4>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Com a previsão de elevação térmica e queda na umidade relativa amanhã à tarde (estimativa de DPV em 1.4 kPa),
              recomenda-se aumentar a proporção de Cálcio no Tanque A para mitigar riscos de "fundo preto" (podridão apical)
              nos cachos de Tomate Grape em rápido enchimento.
            </p>

            {/* Audio Voice Player Controls for the Advisory */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                onClick={handleApplyDosage}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs transition-colors cursor-pointer"
              >
                Aplicar Ajuste de Dosagem Automática
              </button>

              <button
                onClick={() => handlePlayAdvisoryAudio('PT')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isPlayingAdvisoryAudio && advisorySpeechLang === 'PT'
                    ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-secondary" />
                <span>Ouvir Parecer (PT)</span>
              </button>

              <button
                onClick={() => handlePlayAdvisoryAudio('ES')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isPlayingAdvisoryAudio && advisorySpeechLang === 'ES'
                    ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-secondary" />
                <span>Escuchar Dictamen (ES)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cooperative Support Card */}
        <div className="xl:col-span-4 bg-surface-container-lowest rounded-2xl p-5 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-outline uppercase tracking-wider font-semibold">
                Cooperativa Agronorte
              </span>
              <Handshake className="w-5 h-5 text-primary" />
            </div>

            <h4 className="font-display text-base font-bold text-on-surface mb-1">
              Visita Técnica Agendada
            </h4>

            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              O consultor agronômico <strong className="text-on-surface">Dr. Roberto Silva</strong> visitará o Módulo Alpha
              nesta quinta-feira (10:00h) para conferência foliar e validação de brix.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
            <div className="flex items-center gap-1.5 text-xs">
              <CalendarCheck className="w-4 h-4 text-secondary" />
              <span className="font-mono text-xs font-bold text-on-surface">
                Quinta, 10:00 - Estufa 01
              </span>
            </div>

            <button
              onClick={() => {
                setToastMessage('Visita técnica confirmada na agenda do produtor.');
                setTimeout(() => setToastMessage(null), 3500);
              }}
              className="text-xs font-mono text-primary font-bold hover:underline cursor-pointer"
            >
              Confirmar Agenda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
