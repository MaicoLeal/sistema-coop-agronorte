import React from 'react';
import { Language, UserProfile, UserRole, ProductionZone } from '../types';
import {
  LayoutDashboard,
  Grid3X3,
  FlaskConical,
  ClipboardList,
  Package,
  Truck,
  AlertTriangle,
  FileCheck,
  History,
  QrCode,
  Beaker,
  FileBarChart,
  ChevronDown,
  ChevronRight,
  Wifi,
  WifiOff,
  RefreshCw,
  UserCheck,
  RotateCcw,
  Bug,
  Sparkles,
  Sprout,
  SlidersHorizontal,
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

interface NavItem {
  id: string;
  labelPt: string;
  labelEs: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  id: string;
  titlePt: string;
  titleEs: string;
  items: NavItem[];
}

// Grupos operacionais estruturados por etapa do ciclo produtivo
const NAV_GROUPS: NavGroup[] = [
  {
    id: 'producao',
    titlePt: 'Produção & Cultivo',
    titleEs: 'Producción y Cultivo',
    items: [
      { id: 'executive', labelPt: 'Visão Geral', labelEs: 'Visión General', icon: LayoutDashboard },
      { id: 'batches', labelPt: 'Setores & Bancadas', labelEs: 'Sectores y Mesadas', icon: Grid3X3 },
      { id: 'agronomic', labelPt: 'Soluções & pH/EC', labelEs: 'Soluciones y pH/EC', icon: FlaskConical },
      { id: 'inputs', labelPt: 'Insumos & Fertirrigação', labelEs: 'Insumos y Fertirrigación', icon: Beaker },
      { id: 'inspections', labelPt: 'Diário de Campo', labelEs: 'Diario de Campo', icon: ClipboardList },
    ],
  },
  {
    id: 'pos_colheita',
    titlePt: 'Pós-Colheita & Logística',
    titleEs: 'Poscosecha y Logística',
    items: [
      { id: 'harvest', labelPt: 'Colheitas & Packing', labelEs: 'Cosechas y Empaque', icon: Package },
      { id: 'shipments', labelPt: 'Expedição & Cargas', labelEs: 'Expedición y Cargas', icon: Truck },
    ],
  },
  {
    id: 'qualidade',
    titlePt: 'Qualidade & Auditoria',
    titleEs: 'Calidad y Auditoría',
    items: [
      { id: 'recall', labelPt: 'Alertas & Recall', labelEs: 'Alertas y Recall', icon: AlertTriangle },
      { id: 'compliance', labelPt: 'Conformidade Cooperativa', labelEs: 'Conformidad Cooperativa', icon: FileCheck },
      { id: 'audit', labelPt: 'Auditoria & Imutabilidade', labelEs: 'Auditoría e Inmutabilidad', icon: History },
      { id: 'public-trace', labelPt: 'Rastreabilidade Pública', labelEs: 'Trazabilidad Pública', icon: QrCode },
    ],
  },
  {
    id: 'gestao',
    titlePt: 'Gestão & Relatórios',
    titleEs: 'Gestión e Informes',
    items: [
      { id: 'reports', labelPt: 'Relatórios & Exportação', labelEs: 'Informes y Exportación', icon: FileBarChart },
    ],
  },
];

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
  onCloseMobile,
}) => {
  const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  return (
    <>
      {/* Backdrop para visualização mobile */}
      {isOpenOnMobile && (
        <div
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs z-45 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-hidden border-r border-outline-variant/30 select-none transition-transform duration-200 lg:translate-x-0 ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ═══ CABEÇALHO DO MENU LATERAL ═══ */}
        <div className="flex flex-col shrink-0 border-b border-outline-variant/20 bg-surface-container-low">
          {/* Logo da Cooperativa com Selo de Versão */}
          <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="bg-white rounded-xl px-2 py-1 flex items-center justify-center shadow-xs border border-outline-variant/40 shrink-0">
                <img
                  src="/assets/logo-oficial-agronorte-tight.png"
                  alt="Cooperativa Agronorte"
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-on-surface uppercase tracking-wider font-bold block truncate">
                  COOP AGRONORTE
                </span>
                <span className="text-[9px] font-mono text-primary block truncate font-medium">
                  Guayaibí • Paraguay
                </span>
              </div>
            </div>

            {/* Versão clicável */}
            <button
              onClick={onOpenVersionModal}
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold transition-colors cursor-pointer shrink-0"
              title={lang === 'es-PY' ? 'Ver Notas de Versión' : 'Ver Notas de Versão'}
            >
              v1.2
            </button>
          </div>

          {/* Seletor Compacto de Estufa / Zona Ativa */}
          <div className="px-3 pb-2.5">
            <div className="bg-surface-container-high/80 hover:bg-surface-container-high rounded-xl p-2 border border-outline-variant/30 transition-colors">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Sprout className="w-3 h-3 text-primary" />
                  <span>{lang === 'es-PY' ? 'Invernadero Activo' : 'Estufa Ativa'}</span>
                </span>
                <span className="text-[9px] font-mono bg-primary/10 text-primary px-1.5 py-0.2 rounded font-semibold">
                  {currentZone?.cultivar || 'Tomates'}
                </span>
              </div>
              <div className="relative">
                <select
                  value={selectedZoneId}
                  onChange={(e) => onSelectZone(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-on-surface appearance-none pr-5 focus:outline-none cursor-pointer truncate"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id} className="bg-surface text-on-surface">
                      {z.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ═══ CORPO ROLÁVEL: NAVEGAÇÃO OPERACIONAL AGRUPADA ═══ */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin">
          {/* Assistentes Inteligentes (Card Rápido Unificado) */}
          <div className="grid grid-cols-2 gap-1.5">
            {onOpenMateoChat && (
              <button
                onClick={onOpenMateoChat}
                className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-100 border border-emerald-700/40 transition-all cursor-pointer group text-left"
                title="Don Mateo IA"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-emerald-400 shrink-0 bg-emerald-950">
                  <img
                    src="/assets/don-mateo/don-mateo-idle.jpg"
                    alt="Don Mateo"
                    className="w-full h-full object-cover scale-110"
                  />
                </div>
                <div className="min-w-0 flex-1 leading-none">
                  <span className="text-[11px] font-bold block truncate">Don Mateo</span>
                  <span className="text-[9px] text-emerald-300 font-mono">Voz IA</span>
                </div>
              </button>
            )}

            {onOpenPestDiagnosis && (
              <button
                onClick={onOpenPestDiagnosis}
                className="flex items-center gap-2 p-2 rounded-xl bg-secondary-container/80 hover:bg-secondary-container text-on-secondary-container border border-secondary/20 transition-all cursor-pointer group text-left"
                title={lang === 'es-PY' ? 'Diagnóstico de Plagas' : 'Diagnóstico de Pragas'}
              >
                <div className="w-6 h-6 rounded-lg bg-secondary/15 flex items-center justify-center shrink-0">
                  <Bug className="w-3.5 h-3.5 text-secondary group-hover:rotate-12 transition-transform" />
                </div>
                <div className="min-w-0 flex-1 leading-none">
                  <span className="text-[11px] font-bold block truncate">
                    {lang === 'es-PY' ? 'Plagas IA' : 'Pragas IA'}
                  </span>
                  <span className="text-[9px] text-on-secondary-container/80 font-mono">Foto/Áudio</span>
                </div>
              </button>
            )}
          </div>

          {/* Grupos de Navegação Estruturados */}
          {NAV_GROUPS.map((group) => {
            const groupTitle = lang === 'es-PY' ? group.titleEs : group.titlePt;
            return (
              <div key={group.id} className="space-y-1">
                <div className="px-2 pt-1 pb-0.5">
                  <span className="text-[10px] font-mono text-outline uppercase tracking-wider font-bold block">
                    {groupTitle}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const itemLabel = lang === 'es-PY' ? item.labelEs : item.labelPt;

                    return (
                      <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer text-left ${
                          isActive
                            ? 'bg-primary text-on-primary font-bold shadow-xs'
                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-on-primary' : 'text-primary'}`} />
                          <span className="truncate">{itemLabel}</span>
                        </div>
                        {isActive && (
                          <ChevronRight className="w-3.5 h-3.5 text-on-primary/80 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ RODAPÉ DA SIDEBAR: TELEMETRIA, SINCRONIZAÇÃO E PERFIL ═══ */}
        <div className="p-3 border-t border-outline-variant/30 bg-surface-container-low/90 shrink-0 flex flex-col gap-2">
          {/* Card de Status da Conexão / LoRaWAN */}
          <div className="flex items-center justify-between bg-surface-container rounded-lg px-2.5 py-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="font-mono text-[11px] font-semibold text-on-surface">
                {isOnline ? 'LoRaWAN 98.4%' : 'Offline'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Botão de sincronização se houver pendências */}
              <button
                onClick={onSyncNow}
                disabled={!isOnline || pendingSyncCount === 0}
                className={`p-1 rounded text-[10px] font-medium transition-colors ${
                  pendingSyncCount > 0
                    ? 'bg-primary text-on-primary font-bold shadow-xs cursor-pointer animate-pulse'
                    : 'text-on-surface-variant opacity-50'
                }`}
                title={`Sincronização: ${pendingSyncCount} registros pendentes`}
              >
                <RefreshCw className={`w-3 h-3 ${pendingSyncCount > 0 ? 'animate-spin' : ''}`} />
              </button>

              {/* Botão de alternar simulação de rede */}
              <button
                onClick={onToggleOnline}
                className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                title={isOnline ? 'Simular Modo Offline' : 'Restaurar Conexão Online'}
              >
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-amber-600" />}
              </button>
            </div>
          </div>

          {/* Linha com Papel / Idioma / Reset Demo */}
          <div className="flex items-center justify-between gap-1.5 pt-0.5 text-xs">
            {/* Seletor de Perfil (Role) compacto */}
            <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-md text-[10px] flex-1 min-w-0">
              <UserCheck className="w-3 h-3 text-primary shrink-0" />
              <select
                value={currentUser.role}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-transparent text-on-surface focus:outline-none cursor-pointer font-medium w-full truncate text-[10px]"
                title="Alternar Papel de Acesso (RBAC)"
              >
                <option value="quality_auditor" className="bg-surface text-on-surface">Auditor de Qualidade</option>
                <option value="agronomist" className="bg-surface text-on-surface">Agrônomo</option>
                <option value="farm_manager" className="bg-surface text-on-surface">Gerente Geral</option>
                <option value="field_operator" className="bg-surface text-on-surface">Operador Campo</option>
                <option value="packhouse_operator" className="bg-surface text-on-surface">Operador Packing</option>
                <option value="tenant_admin" className="bg-surface text-on-surface">Administrador</option>
              </select>
            </div>

            {/* Alternador de Idioma */}
            <div className="flex items-center bg-surface-container-high rounded-md p-0.5 text-[10px] font-mono shrink-0">
              <button
                onClick={() => onLanguageChange('es-PY')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                  lang === 'es-PY'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Español (Paraguay)"
              >
                ES
              </button>
              <button
                onClick={() => onLanguageChange('pt-BR')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                  lang === 'pt-BR'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Português (Brasil)"
              >
                PT
              </button>
            </div>

            {/* Reset Demo discreto */}
            <button
              onClick={onResetDemo}
              className="p-1 text-on-surface-variant hover:text-error rounded hover:bg-surface-container-high transition-colors shrink-0"
              title="Restaurar dados originais de demonstração"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
