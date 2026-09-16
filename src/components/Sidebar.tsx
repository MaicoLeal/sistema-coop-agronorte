import React from 'react';
import { Language, UserProfile, UserRole, ProductionZone } from '../types';
import { translations } from '../i18n/translations';
import {
  Sprout,
  LayoutDashboard,
  Grid3X3,
  FlaskConical,
  Thermometer,
  ClipboardList,
  Package,
  Truck,
  AlertTriangle,
  FileCheck,
  History,
  QrCode,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Tag,
  Bug,
  Beaker,
  FileBarChart
} from 'lucide-react';

interface SidebarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  pendingSyncCount: number;
  onSyncNow: () => void;
  onResetDemo: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  zones: ProductionZone[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  viewMode?: 'producer_easy' | 'expert_management';
  onToggleViewMode?: () => void;
  onOpenMateoChat?: () => void;
  onOpenVersionModal?: () => void;
  onOpenPestDiagnosis?: () => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  lang,
  onLanguageChange,
  currentUser,
  onRoleChange,
  isOnline,
  onToggleOnline,
  pendingSyncCount,
  onSyncNow,
  onResetDemo,
  activeTab,
  onTabChange,
  zones,
  selectedZoneId,
  onSelectZone,
  viewMode = 'producer_easy',
  onToggleViewMode,
  onOpenMateoChat,
  onOpenVersionModal,
  onOpenPestDiagnosis,
  isOpenOnMobile = false,
  onCloseMobile
}) => {
  const t = translations[lang];

  const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  const navItems = [
    { id: 'executive', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'batches', label: 'Setores & Bancadas', icon: Grid3X3 },
    { id: 'agronomic', label: 'Soluções & pH/EC', icon: FlaskConical },
    { id: 'inputs', label: lang === 'es-PY' ? 'Insumos & Fertirrigación' : 'Insumos & Fertirrigação', icon: Beaker },
    { id: 'inspections', label: 'Diário de Campo', icon: ClipboardList },
    { id: 'harvest', label: 'Colheitas & Packing', icon: Package },
    { id: 'shipments', label: 'Expedição & Logística', icon: Truck },
    { id: 'reports', label: lang === 'es-PY' ? 'Informes & Exportación' : 'Relatórios & Exportação', icon: FileBarChart },
    { id: 'recall', label: 'Alertas & Calibração', icon: AlertTriangle },
    { id: 'compliance', label: 'Relatórios Cooperados', icon: FileCheck },
    { id: 'audit', label: 'Auditoria & Imutabilidade', icon: History },
    { id: 'public-trace', label: 'Rastreabilidade Pública', icon: QrCode },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenOnMobile && (
        <div
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs z-45 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto border-r border-outline-variant/30 select-none transition-transform duration-200 lg:translate-x-0 ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <div className="flex flex-col">
        {/* Brand Header with Official Logo */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
          <div className="bg-white rounded-xl px-2.5 py-1.5 flex items-center justify-center shadow-xs border border-outline-variant/40 shrink-0">
            <img
              src="/assets/logo-oficial-agronorte-tight.png"
              alt="Cooperativa Agronorte"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider block truncate font-bold">
                COOP AGRONORTE
              </span>
              <button
                onClick={onOpenVersionModal}
                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold transition-colors cursor-pointer shrink-0"
                title="Ver Notas de Versão"
              >
                v1.2
              </button>
            </div>
            <span className="text-[9px] font-mono text-emerald-700 block truncate font-semibold">
              Guayaibí • Paraguay
            </span>
          </div>
        </div>

        {/* Estufa Ativa Dropdown Card */}
        <div className="px-6 py-2">
          <div className="bg-surface-container-high rounded-lg p-3">
            <span className="text-[11px] font-mono text-on-surface-variant block uppercase tracking-wider mb-1 font-semibold">
              Estufa Ativa
            </span>
            <div className="relative">
              <select
                value={selectedZoneId}
                onChange={(e) => onSelectZone(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-on-surface appearance-none pr-6 focus:outline-none cursor-pointer truncate"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id} className="bg-surface text-on-surface">
                    {z.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-on-surface-variant absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span className="text-xs text-on-surface-variant block truncate mt-0.5">
              {currentZone ? `${currentZone.cultivar} • ${currentZone.systemType}` : 'Tomates Grape e Italiano'}
            </span>
          </div>
        </div>

        {/* Producer Mode / Full ERP Switch Card */}
        {onToggleViewMode && (
          <div className="px-6 py-1.5">
            <button
              onClick={onToggleViewMode}
              className={`w-full px-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer ${
                viewMode === 'producer_easy'
                  ? 'bg-primary text-on-primary hover:bg-primary-container'
                  : 'bg-surface-container-high hover:bg-surface-container text-on-surface'
              }`}
            >
              <span>{viewMode === 'producer_easy' ? '🌾 Modo Produtor Ativo' : '🌾 Ir para Modo Produtor'}</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded uppercase">
                {viewMode === 'producer_easy' ? 'Fácil' : 'Mudar'}
              </span>
            </button>
          </div>
        )}

        {/* Don Mateo Voice Assistant Pill */}
        {onOpenMateoChat && (
          <div className="px-6 py-1.5">
            <button
              onClick={onOpenMateoChat}
              className="w-full bg-emerald-950/70 hover:bg-emerald-900 text-emerald-100 px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-between shadow-xs border border-emerald-700/40 hover:border-emerald-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-emerald-400 shrink-0 bg-emerald-950">
                  <img
                    src="/assets/don-mateo/don-mateo-idle.jpg"
                    alt="Don Mateo 3D"
                    className="w-full h-full object-cover scale-110"
                  />
                </div>
                <span>Don Mateo (IA 3D)</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-800/80 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-600/40 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                3D
              </span>
            </button>
          </div>
        )}

        {/* AI Pest Diagnosis Action Pill */}
        {onOpenPestDiagnosis && (
          <div className="px-6 py-1.5">
            <button
              onClick={onOpenPestDiagnosis}
              className="w-full bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-secondary group-hover:rotate-12 transition-transform" />
                <span>IA Diagnóstico de Pragas</span>
              </div>
              <span className="text-[10px] font-mono bg-white/60 px-1.5 py-0.2 rounded font-bold">
                PT/ES
              </span>
            </button>
          </div>
        )}

        {/* Navegação Operacional */}
        <div className="px-6 py-2">
          <span className="text-[11px] font-mono text-outline uppercase tracking-wider block px-1 mb-1.5 font-semibold">
            Navegação Operacional
          </span>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* LoRaWAN & Status Footer */}
      <div className="p-5 flex flex-col gap-2.5 border-t border-outline-variant/30 bg-surface-container-low/80">
        {/* LoRaWAN Telemetry Card */}
        <div className="bg-surface-container rounded-xl p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-on-surface-variant uppercase font-semibold">
              Rede LoRaWAN
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
          </div>
          <span className="font-mono text-base text-primary font-bold">
            {isOnline ? '98.4% Ativa' : 'Modo Offline'}
          </span>
          <span className="text-xs text-on-surface-variant">
            {isOnline ? '24/24 Sensores Online' : 'Cache local habilitado'}
          </span>
        </div>

        {/* Gateway info and Offline Toggle */}
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <button
            onClick={onToggleOnline}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
              isOnline
                ? 'bg-surface-container-high border-outline-variant/40 text-primary hover:bg-surface-variant'
                : 'bg-error-container text-on-error-container border-error/30'
            }`}
            title="Alternar simulação de conexão de campo"
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? 'GTW-09 • 12ms' : 'Offline'}</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={onSyncNow}
            disabled={!isOnline || pendingSyncCount === 0}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
              pendingSyncCount > 0
                ? 'bg-primary text-on-primary font-semibold shadow-xs animate-pulse cursor-pointer'
                : 'text-on-surface-variant opacity-60'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${pendingSyncCount > 0 ? 'animate-spin' : ''}`} />
            <span>Sincronizar {pendingSyncCount > 0 && `(${pendingSyncCount})`}</span>
          </button>
        </div>

        {/* Role & Language Row */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-outline-variant/20 text-xs">
          {/* Role selector */}
          <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-md text-[11px] flex-1 truncate">
            <UserCheck className="w-3 h-3 text-primary shrink-0" />
            <select
              value={currentUser.role}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-on-surface focus:outline-none cursor-pointer font-medium w-full truncate text-[11px]"
            >
              <option value="quality_auditor" className="bg-surface text-on-surface">Auditor de Qualidade</option>
              <option value="agronomist" className="bg-surface text-on-surface">Agrônomo</option>
              <option value="farm_manager" className="bg-surface text-on-surface">Gerente Geral</option>
              <option value="field_operator" className="bg-surface text-on-surface">Operador Campo</option>
              <option value="packhouse_operator" className="bg-surface text-on-surface">Operador Packing</option>
              <option value="tenant_admin" className="bg-surface text-on-surface">Administrador</option>
            </select>
          </div>

          {/* Language Switch */}
          <div className="flex items-center bg-surface-container-high rounded-md p-0.5 text-[11px] font-mono">
            <button
              onClick={() => onLanguageChange('es-PY')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                lang === 'es-PY' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => onLanguageChange('pt-BR')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                lang === 'pt-BR' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              PT
            </button>
          </div>

          {/* Reset Demo button */}
          <button
            onClick={onResetDemo}
            className="p-1 text-on-surface-variant hover:text-error rounded hover:bg-surface-container-high transition-colors"
            title="Restabelecer dados originais (Reset DEMO)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};
