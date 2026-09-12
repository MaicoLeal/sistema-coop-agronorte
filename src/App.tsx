import React, { useState, useEffect } from 'react';
import { Language, UserRole, UserProfile } from './types';
import { StorageService } from './services/storageService';
import { Header } from './components/Header';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { AgronomicDashboard } from './components/AgronomicDashboard';
import { TraceabilityTree } from './components/TraceabilityTree';
import { FieldInspections } from './components/FieldInspections';
import { HarvestAndPacking } from './components/HarvestAndPacking';
import { InventoryAndShipments } from './components/InventoryAndShipments';
import { RecallSimulator } from './components/RecallSimulator';
import { ComplianceMatrixView } from './components/ComplianceMatrixView';
import { AuditLogView } from './components/AuditLogView';
import { PublicTraceView } from './components/PublicTraceView';
import { VersionModal } from './components/VersionModal';
import { SmartPestDiagnosisModal } from './components/SmartPestDiagnosisModal';
import { Sidebar } from './components/Sidebar';
import { AnimatedLandingPage } from './components/AnimatedLandingPage';
import { ProducerAvatar } from './components/ProducerAvatar';
import { ProducerQuickView } from './components/ProducerQuickView';

export default function App() {
  const [lang, setLang] = useState<Language>('es-PY'); // Default Spanish of Paraguay
  const [activeTab, setActiveTab] = useState<string>('executive');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [selectedPublicToken, setSelectedPublicToken] = useState<string>('trace_token_tom_088_safe');
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false);
  const [showPestDiagnosisModal, setShowPestDiagnosisModal] = useState<boolean>(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-estufa-01');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [appToast, setAppToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'producer_easy' | 'expert_management'>('producer_easy');
  const [showMateoChat, setShowMateoChat] = useState<boolean>(false);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setAppToast({ message, type });
    setTimeout(() => {
      setAppToast(null);
    }, 4500);
  };

  // Current logged in user (with RBAC role switcher)
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr-carlos-ortiz',
    name: 'Ing. Carlos Ortiz',
    email: 'carlos.ortiz@agronorte.com.py',
    role: 'quality_auditor',
    tenantId: 'tenant-agronorte-demo',
    isDemo: true
  });

  // Domain state
  const [zones, setZones] = useState(StorageService.getZones());
  const [batches, setBatches] = useState(StorageService.getBatches());
  const [harvests, setHarvests] = useState(StorageService.getHarvests());
  const [packLots, setPackLots] = useState(StorageService.getPackLots());
  const [lotLinks, setLotLinks] = useState(StorageService.getLotLinks());
  const [shipments, setShipments] = useState(StorageService.getShipments());
  const [alerts, setAlerts] = useState(StorageService.getAlerts());
  const [inspections, setInspections] = useState(StorageService.getInspections());
  const [compliance, setCompliance] = useState(StorageService.getCompliance());
  const [auditLogs, setAuditLogs] = useState(StorageService.getAuditLog());

  const refreshData = () => {
    setZones(StorageService.getZones());
    setBatches(StorageService.getBatches());
    setHarvests(StorageService.getHarvests());
    setPackLots(StorageService.getPackLots());
    setLotLinks(StorageService.getLotLinks());
    setShipments(StorageService.getShipments());
    setAlerts(StorageService.getAlerts());
    setInspections(StorageService.getInspections());
    setCompliance(StorageService.getCompliance());
    setAuditLogs(StorageService.getAuditLog());
    setPendingSyncCount(StorageService.getOutbox().length);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role
    }));
  };

  const handleToggleOnline = () => {
    setIsOnline((prev) => !prev);
  };

  const handleSyncNow = () => {
    // Process outbox
    const outbox = StorageService.getOutbox();
    if (outbox.length === 0) return;

    // Mark all inspections as synced
    const currentInspections = StorageService.getInspections();
    currentInspections.forEach((insp) => {
      insp.syncStatus = 'synced';
    });
    StorageService.saveInspections(currentInspections);
    StorageService.clearOutbox();

    StorageService.appendAudit(
      currentUser.email,
      currentUser.role,
      'OUTBOX_SYNC_COMPLETED',
      'SyncEngine',
      `sync-${Date.now()}`,
      `Sincronização de ${outbox.length} operações offline executada com sucesso.`
    );

    refreshData();
    showToast(`Sincronização concluída: ${outbox.length} registros sincronizados com o servidor central.`, 'success');
  };

  const handleConfirmResetDemo = () => {
    StorageService.resetToSeed();
    refreshData();
    setShowResetConfirm(false);
    showToast('Dados de demonstração restaurados com sucesso.', 'info');
  };

  const handleOpenPublicTrace = (token: string) => {
    setSelectedPublicToken(token);
    setActiveTab('public-trace');
  };

  if (showLanding) {
    return (
      <AnimatedLandingPage
        lang={lang}
        onLanguageChange={setLang}
        onEnter={(mode) => {
          if (mode) setViewMode(mode);
          setShowLanding(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans selection:bg-primary selection:text-on-primary antialiased">
      {/* Fixed Left Sidebar Navigation */}
      <Sidebar
        lang={lang}
        onLanguageChange={setLang}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        pendingSyncCount={pendingSyncCount}
        onSyncNow={handleSyncNow}
        onResetDemo={() => setShowResetConfirm(true)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setViewMode('expert_management');
          setIsMobileSidebarOpen(false);
        }}
        zones={zones}
        selectedZoneId={selectedZoneId}
        onSelectZone={setSelectedZoneId}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((prev) => (prev === 'producer_easy' ? 'expert_management' : 'producer_easy'))}
        onOpenMateoChat={() => setShowMateoChat(true)}
        onOpenVersionModal={() => setShowVersionModal(true)}
        onOpenPestDiagnosis={() => setShowPestDiagnosisModal(true)}
        isOpenOnMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Viewport (Offset by 72 on lg screens) */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <Header
          lang={lang}
          currentUser={currentUser}
          activeZone={zones.find((z) => z.id === selectedZoneId) || zones[0]}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode((prev) => (prev === 'producer_easy' ? 'expert_management' : 'producer_easy'))}
          onOpenMateoChat={() => setShowMateoChat(true)}
          onOpenNotifications={() => {
            setViewMode('expert_management');
            setActiveTab('recall');
          }}
          onOpenPestDiagnosis={() => setShowPestDiagnosisModal(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          unreadAlertsCount={alerts.filter((a) => a.status === 'new').length}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full pt-20 px-4 sm:px-6 lg:px-8 pb-12">
          {viewMode === 'producer_easy' ? (
            <ProducerQuickView
              lang={lang}
              currentUser={currentUser}
              zones={zones}
              batches={batches}
              onSwitchToExpert={() => setViewMode('expert_management')}
              onOpenPestDiagnosis={() => setShowPestDiagnosisModal(true)}
              onOpenMateoChat={() => setShowMateoChat(true)}
              onHarvestSaved={refreshData}
              onSelectZone={setSelectedZoneId}
            />
          ) : (
            <>
              {activeTab === 'executive' && (
                <ExecutiveDashboard
                  lang={lang}
                  zones={zones}
                  batches={batches}
                  alerts={alerts}
                  harvests={harvests}
                  packLots={packLots}
                  shipments={shipments}
                  onNavigate={setActiveTab}
                  onOpenVersionModal={() => setShowVersionModal(true)}
                  onOpenPestDiagnosis={() => setShowPestDiagnosisModal(true)}
                />
              )}

              {activeTab === 'agronomic' && (
                <AgronomicDashboard lang={lang} zones={zones} />
              )}

              {activeTab === 'batches' && (
                <TraceabilityTree
                  lang={lang}
                  batches={batches}
                  lotLinks={lotLinks}
                  harvests={harvests}
                  packLots={packLots}
                  shipments={shipments}
                  currentUser={currentUser}
                  onRefreshData={refreshData}
                  onOpenPublicTrace={handleOpenPublicTrace}
                />
              )}

              {activeTab === 'inspections' && (
                <FieldInspections
                  lang={lang}
                  inspections={inspections}
                  zones={zones}
                  batches={batches}
                  currentUser={currentUser}
                  isOnline={isOnline}
                  onRefreshData={refreshData}
                  onOpenPestDiagnosis={() => setShowPestDiagnosisModal(true)}
                />
              )}

              {activeTab === 'harvest' && (
                <HarvestAndPacking
                  lang={lang}
                  harvests={harvests}
                  packLots={packLots}
                  batches={batches}
                  currentUser={currentUser}
                  onRefreshData={refreshData}
                  onOpenPublicTrace={handleOpenPublicTrace}
                />
              )}

              {activeTab === 'shipments' && (
                <InventoryAndShipments
                  lang={lang}
                  shipments={shipments}
                  packLots={packLots}
                  batches={batches}
                  currentUser={currentUser}
                  onRefreshData={refreshData}
                />
              )}

              {activeTab === 'recall' && (
                <RecallSimulator
                  lang={lang}
                  batches={batches}
                  harvests={harvests}
                  packLots={packLots}
                  shipments={shipments}
                  currentUser={currentUser}
                  onRefreshData={refreshData}
                />
              )}

              {activeTab === 'compliance' && (
                <ComplianceMatrixView lang={lang} complianceList={compliance} />
              )}

              {activeTab === 'audit' && (
                <AuditLogView lang={lang} auditLogs={auditLogs} />
              )}

              {activeTab === 'public-trace' && (
                <PublicTraceView
                  lang={lang}
                  initialToken={selectedPublicToken}
                  onBack={() => setActiveTab('executive')}
                />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-outline-variant/30 bg-surface-container-low/80 py-4 px-6 text-xs text-on-surface-variant">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Coop Agronorte • Sistema de Manejo Hidropônico &amp; Rastreabilidade (DEMO)
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <button
                onClick={() => setShowVersionModal(true)}
                className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Versão 1.2.0</span>
                <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.2 rounded border border-outline-variant/40">
                  Release Notes
                </span>
              </button>
              <span className="text-outline-variant">•</span>
              <span>Fuso: America/Asuncion • LoRaWAN Ready</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Multimodal AI Pest/Fungus Diagnosis Modal */}
      {showPestDiagnosisModal && (
        <SmartPestDiagnosisModal
          lang={lang}
          zones={zones}
          batches={batches}
          currentUser={currentUser}
          onClose={() => setShowPestDiagnosisModal(false)}
          onInspectionSaved={() => {
            setShowPestDiagnosisModal(false);
            refreshData();
          }}
        />
      )}

      {/* Version Notes Modal */}
      {showVersionModal && (
        <VersionModal
          lang={lang}
          onClose={() => setShowVersionModal(false)}
        />
      )}

      {/* Reset Demo Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-on-surface">Restabelecer Dados de Demonstração?</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Todos os lotes, colheitas, embalagens e registros de telemetria retornarão ao estado inicial padrão da Cooperativa Agronorte (DEMO).
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmResetDemo}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:bg-primary-container transition-colors cursor-pointer shadow-xs"
              >
                Sim, Restaurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Application Toast */}
      {appToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md">
          <div className={`p-3.5 rounded-xl shadow-lg border flex items-center gap-3 text-xs font-semibold ${
            appToast.type === 'error'
              ? 'bg-error text-on-error border-error-container'
              : appToast.type === 'info'
              ? 'bg-secondary text-on-secondary border-secondary-container'
              : 'bg-primary text-on-primary border-primary-container'
          }`}>
            <span>{appToast.message}</span>
            <button
              onClick={() => setAppToast(null)}
              className="opacity-70 hover:opacity-100 ml-auto cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Interactive Animated Avatar (Don Mateo) with Human Male Voice */}
      <ProducerAvatar
        lang={lang}
        isOpenExternal={showMateoChat}
        onCloseExternal={() => setShowMateoChat(false)}
        onOpenHarvest={() => {
          if (viewMode === 'producer_easy') {
            // Already available directly in easy mode
          } else {
            setActiveTab('harvest');
          }
        }}
        onOpenPestDiagnosis={() => setShowPestDiagnosisModal(true)}
        onOpenGreenhouses={() => {
          setViewMode('expert_management');
          setActiveTab('agronomic');
        }}
      />
    </div>
  );
}
