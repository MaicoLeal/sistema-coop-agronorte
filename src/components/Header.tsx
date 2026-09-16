import React from 'react';
import { Language, UserProfile, ProductionZone } from '../types';
import {
  Sprout,
  RotateCw,
  Bell,
  Bug,
  ChevronDown,
  Menu,
  ClipboardList
} from 'lucide-react';

interface HeaderProps {
  lang: Language;
  currentUser: UserProfile;
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

export const Header: React.FC<HeaderProps> = ({
  lang,
  currentUser,
  activeZone,
  viewMode = 'producer_easy',
  onToggleViewMode,
  onOpenMateoChat,
  onOpenNotifications,
  onOpenPestDiagnosis,
  onOpenFieldInspections,
  onToggleMobileSidebar,
  unreadAlertsCount = 2
}) => {
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 sm:px-6 border-b border-outline-variant/30">
      {/* Left items: Mobile Menu & Active Module & System Indicators */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
          aria-label="Abrir Menu Lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Logo */}
        <div className="flex items-center lg:hidden">
          <img
            src="/assets/logo-oficial-agronorte.png"
            alt="Cooperativa Agronorte"
            className="h-7 w-auto object-contain"
          />
        </div>

        {/* Module Pill */}
        <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1 rounded-full text-xs">
          <span className="font-mono text-[11px] text-on-surface-variant uppercase font-semibold hidden sm:inline">
            Módulo:
          </span>
          <div className="flex items-center gap-1.5 text-on-surface font-semibold text-xs truncate">
            <Sprout className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{activeZone ? activeZone.name : 'Alpha - Estufa 01'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant ml-0.5 shrink-0" />
          </div>
        </div>

        {/* Harvest Cycle Pill */}
        <div className="hidden xl:flex items-center gap-1.5 bg-surface-container-high px-3 py-1 rounded-full text-xs">
          <span className="font-mono text-[11px] text-on-surface-variant uppercase font-semibold">
            Safra:
          </span>
          <span className="font-semibold text-on-surface">2025/1 - Ciclo II</span>
        </div>

        {/* Automated Irrigation status badge */}
        <div className="hidden md:flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-mono text-[11px] font-bold">
          <RotateCw className="w-3 h-3 animate-spin" />
          <span>Irrigação Automática</span>
        </div>

        {/* Pest AI Quick Action in Top Header */}
        {onOpenPestDiagnosis && (
          <button
            onClick={onOpenPestDiagnosis}
            className="hidden sm:flex items-center gap-1.5 bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>IA Diagnóstico (Foto/Áudio)</span>
          </button>
        )}

        {/* Field Inspections Quick Action in Top Header */}
        {onOpenFieldInspections && (
          <button
            onClick={onOpenFieldInspections}
            className="hidden xl:flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-container text-on-surface px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer shadow-xs border border-outline-variant/40"
            title="Abrir Diário e Apontamento de Campo"
          >
            <ClipboardList className="w-3.5 h-3.5 text-primary" />
            <span>Diário de Campo</span>
          </button>
        )}
      </div>

      {/* Right items: View Mode Switcher, Don Mateo Trigger, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle Mode Button (Produtor / Gestão) */}
        {onToggleViewMode && (
          <button
            onClick={onToggleViewMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
              viewMode === 'producer_easy'
                ? 'bg-surface-container-highest text-on-surface hover:bg-surface-container'
                : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container'
            }`}
            title={viewMode === 'producer_easy' ? 'Mudar para Modo Gestão Completa' : 'Mudar para Modo Fácil do Produtor'}
          >
            <span>{viewMode === 'producer_easy' ? '💻 Painel Gestão' : '🌾 Modo Produtor'}</span>
          </button>
        )}

        {/* Don Mateo Voice Button */}
        {onOpenMateoChat && (
          <button
            onClick={onOpenMateoChat}
            className="flex items-center gap-2 bg-emerald-950/70 hover:bg-emerald-850 text-emerald-100 pl-1.5 pr-3 py-1 rounded-full text-xs font-bold border border-emerald-600/40 hover:border-emerald-400 transition-all cursor-pointer shadow-xs group"
            title="Conversar com Don Mateo (Assistente 3D)"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-emerald-400/80 shrink-0 bg-emerald-950">
              <img
                src="/assets/don-mateo/don-mateo-idle.jpg"
                alt="Don Mateo 3D"
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Don Mateo 3D</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative flex items-center">
          <button
            onClick={onOpenNotifications}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            type="button"
            title="Alertas e Notificações Técnicas"
          >
            <Bell className="w-5 h-5" />
          </button>
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface animate-pulse"></span>
          )}
        </div>

        <div className="h-7 w-px bg-outline-variant"></div>

        {/* User profile */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-on-surface block font-bold leading-tight">
              {currentUser.name}
            </span>
            <span className="text-[10px] font-mono text-on-surface-variant block uppercase font-medium">
              {currentUser.role.replace('_', ' ')} • Guayaibí, San Pedro
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center text-xs shadow-xs ring-1 ring-outline-variant shrink-0">
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
