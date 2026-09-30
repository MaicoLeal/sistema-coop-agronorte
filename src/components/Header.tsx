import React from 'react';
import { Language, UserProfile, ProductionZone } from '../types';
import { WeatherWidget } from './WeatherWidget';
import {
  Sprout,
  RotateCw,
  Bell,
  Menu,
  ChevronRight,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  lang: Language;
  currentUser: UserProfile;
  activeTab?: string;
  activeZone?: ProductionZone;
  viewMode?: 'producer_easy' | 'expert_management';
  onToggleViewMode?: () => void;
  onOpenMateoChat?: () => void;
  onOpenNotifications?: () => void;
  onOpenPestDiagnosis?: () => void;
  onOpenFieldInspections?: () => void;
  onToggleMobileSidebar?: () => void;
  unreadAlertsCount?: number;
}

// Breadcrumb lookup for each module
const MODULE_BREADCRUMBS: Record<
  string,
  { groupPt: string; groupEs: string; titlePt: string; titleEs: string }
> = {
  executive: {
    groupPt: 'Produção & Cultivo',
    groupEs: 'Producción y Cultivo',
    titlePt: 'Visão Geral',
    titleEs: 'Visión General',
  },
  batches: {
    groupPt: 'Produção & Cultivo',
    groupEs: 'Producción y Cultivo',
    titlePt: 'Setores & Bancadas',
    titleEs: 'Sectores y Mesadas',
  },
  agronomic: {
    groupPt: 'Produção & Cultivo',
    groupEs: 'Producción y Cultivo',
    titlePt: 'Soluções & pH/EC',
    titleEs: 'Soluciones y pH/EC',
  },
  inputs: {
    groupPt: 'Produção & Cultivo',
    groupEs: 'Producción y Cultivo',
    titlePt: 'Insumos & Fertirrigação',
    titleEs: 'Insumos y Fertirrigación',
  },
  inspections: {
    groupPt: 'Produção & Cultivo',
    groupEs: 'Producción y Cultivo',
    titlePt: 'Diário de Campo',
    titleEs: 'Diario de Campo',
  },
  harvest: {
    groupPt: 'Pós-Colheita & Logística',
    groupEs: 'Poscosecha y Logística',
    titlePt: 'Colheitas & Packing',
    titleEs: 'Cosechas y Empaque',
  },
  shipments: {
    groupPt: 'Pós-Colheita & Logística',
    groupEs: 'Poscosecha y Logística',
    titlePt: 'Expedição & Cargas',
    titleEs: 'Expedición y Cargas',
  },
  recall: {
    groupPt: 'Qualidade & Auditoria',
    groupEs: 'Calidad y Auditoría',
    titlePt: 'Alertas & Recall',
    titleEs: 'Alertas y Recall',
  },
  compliance: {
    groupPt: 'Qualidade & Auditoria',
    groupEs: 'Calidad y Auditoría',
    titlePt: 'Conformidade Cooperativa',
    titleEs: 'Conformidad Cooperativa',
  },
  audit: {
    groupPt: 'Qualidade & Auditoria',
    groupEs: 'Calidad y Auditoría',
    titlePt: 'Auditoria & Imutabilidade',
    titleEs: 'Auditoría e Inmutabilidad',
  },
  'public-trace': {
    groupPt: 'Qualidade & Auditoria',
    groupEs: 'Calidad y Auditoría',
    titlePt: 'Rastreabilidade Pública',
    titleEs: 'Trazabilidad Pública',
  },
  reports: {
    groupPt: 'Inteligência & Relatórios',
    groupEs: 'Gestión e Informes',
    titlePt: 'Relatórios & Exportação',
    titleEs: 'Informes y Exportación',
  },
};

export const Header: React.FC<HeaderProps> = ({
  lang,
  currentUser,
  activeTab = 'executive',
  activeZone,
  viewMode = 'producer_easy',
  onToggleViewMode,
  onOpenMateoChat,
  onOpenNotifications,
  onToggleMobileSidebar,
  unreadAlertsCount = 2,
}) => {
  const currentBreadcrumb = MODULE_BREADCRUMBS[activeTab] || {
    groupPt: 'Operações',
    groupEs: 'Operaciones',
    titlePt: 'Módulo Ativo',
    titleEs: 'Módulo Activo',
  };

  const groupLabel = lang === 'es-PY' ? currentBreadcrumb.groupEs : currentBreadcrumb.groupPt;
  const titleLabel = lang === 'es-PY' ? currentBreadcrumb.titleEs : currentBreadcrumb.titlePt;

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.03)] z-40 flex items-center justify-between px-4 sm:px-6 border-b border-outline-variant/30 select-none">
      {/* ─── LADO ESQUERDO: Contexto Operacional & Breadcrumb ─── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Toggle do Menu Lateral no Mobile */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
          aria-label="Abrir Menu Lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo Mobile */}
        <div className="flex items-center lg:hidden shrink-0">
          <img
            src="/assets/logo-oficial-agronorte-tight.png"
            alt="Cooperativa Agronorte"
            className="h-7 w-auto object-contain"
          />
        </div>

        {/* Breadcrumb limpo do módulo atual (Desktop) */}
        <div className="hidden sm:flex items-center gap-2 text-xs truncate">
          <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant/80 font-semibold truncate">
            {groupLabel}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-outline-variant shrink-0" />
          <span className="font-bold text-sm text-on-surface truncate">
            {titleLabel}
          </span>
        </div>

        {/* Tag da Estufa Ativa (Contexto Físico de Cultivo) */}
        <div className="flex items-center gap-1.5 bg-surface-container-high/80 border border-outline-variant/40 px-2.5 py-1 rounded-full text-xs text-on-surface shrink-0">
          <Sprout className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="font-semibold text-[11px] max-w-[130px] sm:max-w-[200px] truncate">
            {activeZone ? activeZone.name : 'Estufa 01'}
          </span>
        </div>
      </div>

      {/* ─── LADO DIREITO: Clima em Tempo Real, Status Unificado, Ações e Perfil ─── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Previsão do Tempo e Alertas Climáticos (Chuva, Vento, Sol Forte) */}
        <WeatherWidget lang={lang} />

        {/* Status IoT e Automação Unificado (Limpo e profissional) */}
        <div className="hidden md:flex items-center gap-2 bg-primary/5 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
            IoT & Irrigação Online
          </span>
        </div>

        {/* Alternador de Modo (Produtor / Gestão Completa) */}
        {onToggleViewMode && (
          <button
            onClick={onToggleViewMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
              viewMode === 'producer_easy'
                ? 'bg-surface-container-highest text-on-surface hover:bg-surface-container'
                : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container'
            }`}
            title={
              viewMode === 'producer_easy'
                ? 'Mudar para Painel de Gestão Completa'
                : 'Mudar para Modo Fácil do Produtor'
            }
          >
            <span>{viewMode === 'producer_easy' ? '🖥️ Painel Gestão' : '🌾 Modo Produtor'}</span>
          </button>
        )}

        {/* Acesso Rápido Don Mateo IA com voz */}
        {onOpenMateoChat && (
          <button
            onClick={onOpenMateoChat}
            className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-100 pl-1 pr-2.5 py-1 rounded-full text-xs font-bold border border-emerald-600/40 hover:border-emerald-400 transition-all cursor-pointer shadow-xs"
            title={lang === 'pt-BR' ? 'Consultor Agrícola Don Mateo' : 'Asesor Agrícola Don Mateo'}
          >
            <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-emerald-400/80 shrink-0 bg-emerald-950">
              <img
                src="/assets/don-mateo/don-mateo-idle.jpg"
                alt="Don Mateo"
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <span className="hidden sm:inline font-sans text-xs">Don Mateo</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
        )}

        {/* Notificações / Alertas Técnicos */}
        <div className="relative flex items-center">
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            type="button"
            title={lang === 'es-PY' ? 'Alertas y Notificaciones' : 'Alertas e Notificações'}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-error text-on-error font-mono text-[9px] font-bold ring-2 ring-surface">
              {unreadAlertsCount}
            </span>
          )}
        </div>

        <div className="h-5 w-px bg-outline-variant/50 hidden sm:block"></div>

        {/* Perfil do Usuário com avatar */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden xl:block">
            <span className="text-xs text-on-surface block font-bold leading-tight">
              {currentUser.name}
            </span>
            <span className="text-[10px] font-mono text-on-surface-variant block uppercase font-medium">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>

          <div
            className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center text-xs shadow-xs ring-1 ring-outline-variant/60 shrink-0 cursor-pointer"
            title={`${currentUser.name} (${currentUser.role})`}
          >
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
        </div>
      </div>
    </header>
  );
};
