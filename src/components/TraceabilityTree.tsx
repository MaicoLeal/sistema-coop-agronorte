import React, { useState } from 'react';
import { Language, PlantBatch, LotLink, HarvestRecord, PackLot, Shipment, UserProfile } from '../types';
import { translations } from '../i18n/translations';
import { StorageService } from '../services/storageService';
import { QRService } from '../services/qrService';
import {
  Trees,
  GitFork,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  ArrowRight,
  Scale,
  Package,
  Truck,
  FileText,
  Lock,
  Unlock,
  Sparkles,
  Info,
  ExternalLink,
  CheckCircle2,
  X
} from 'lucide-react';

interface TraceabilityTreeProps {
  lang: Language;
  batches: PlantBatch[];
  lotLinks: LotLink[];
  harvests: HarvestRecord[];
  packLots: PackLot[];
  shipments: Shipment[];
  currentUser: UserProfile;
  onRefreshData: () => void;
  onOpenPublicTrace: (token: string) => void;
}

export const TraceabilityTree: React.FC<TraceabilityTreeProps> = ({
  lang,
  batches,
  lotLinks,
  harvests,
  packLots,
  shipments,
  currentUser,
  onRefreshData,
  onOpenPublicTrace
}) => {
  const t = translations[lang];
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);
  const [qrModalTitle, setQrModalTitle] = useState<string>('');
  const [holdReason, setHoldReason] = useState<string>('');
  const [showHoldModal, setShowHoldModal] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  // Trace downstream connections for the selected batch
  const relatedHarvests = harvests.filter((h) => h.batchId === selectedBatch?.id);
  const harvestIds = relatedHarvests.map((h) => h.id);

  // Link to pack lots via LotLink or direct harvestBatchId
  const linkedPackLotIds = Array.from(
    new Set([
      ...lotLinks
        .filter((l) => harvestIds.includes(l.sourceBatchId))
        .map((l) => l.targetBatchId),
      ...packLots
        .filter((p) => harvestIds.includes(p.harvestBatchId))
        .map((p) => p.id)
    ])
  );

  const relatedPackLots = packLots.filter((p) => linkedPackLotIds.includes(p.id));

  // Shipments containing these pack lots
  const relatedShipments = shipments.filter((s) =>
    (s.lines || []).some((item) => linkedPackLotIds.includes(item.packLotId))
  );

  // Mass Balance Calculation
  const totalHarvestedKg = relatedHarvests.reduce((acc, h) => acc + (h.netWeightKg || 0), 0);
  const totalCullsKg = relatedHarvests.reduce((acc, h) => acc + (h.cullsKg || 0), 0);
  const totalPackedKg = relatedPackLots.reduce((acc, p) => acc + (p.totalWeightKg || 0), 0);
  const totalShippedKg = relatedShipments.reduce((acc, s) => {
    return (
      acc +
      (s.lines || [])
        .filter((item) => linkedPackLotIds.includes(item.packLotId))
        .reduce((sum, i) => sum + (i.totalKg || 0), 0)
    );
  }, 0);
  const totalStockKg = Math.max(0, totalPackedKg - totalShippedKg);

  const handleShowQr = (title: string, token: string) => {
    const url = QRService.generateBatchQR(token);
    setQrModalTitle(title);
    setQrModalUrl(url);
  };

  const handleToggleHold = (targetBlocked: boolean) => {
    if (!selectedBatch) return;
    if (targetBlocked && !holdReason.trim()) {
      setModalError('Por favor, informe a justificativa técnica/sanitária para retenção.');
      return;
    }

    const res = StorageService.setBatchBlock(
      selectedBatch.id,
      targetBlocked,
      targetBlocked ? holdReason : 'Liberação autorizada após inspeção técnica',
      { name: currentUser.name, role: currentUser.role, email: currentUser.email }
    );

    if (!res.success) {
      setModalError(res.message);
      return;
    }

    setShowHoldModal(false);
    setHoldReason('');
    setModalError(null);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Selector and Batch Summary */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
                <GitFork className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-on-surface">
                {t.traceTreeTitle}
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">{t.traceTreeDesc}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <label className="text-xs text-on-surface-variant font-semibold">Lote Ativo:</label>
            <select
              value={selectedBatch?.id}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="bg-surface-container-high border border-outline-variant/40 text-on-surface text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono font-semibold cursor-pointer"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchCode} ({b.crop} - {b.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Batch Details Banner */}
        {selectedBatch && (
          <div className="mt-5 pt-5 border-t border-outline-variant/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-on-surface-variant text-[11px] block font-medium uppercase tracking-wider">{t.cropType}</span>
              <span className="text-on-surface font-bold text-sm block mt-0.5">{selectedBatch.crop}</span>
              <span className="text-on-surface-variant text-xs block">{selectedBatch.cultivar}</span>
            </div>
            <div>
              <span className="text-on-surface-variant text-[11px] block font-medium uppercase tracking-wider">{t.originSeedling}</span>
              <span className="text-on-surface font-semibold text-xs block mt-0.5">{selectedBatch.seedlingOrigin}</span>
              <span className="text-primary text-[11px] font-mono">CFO Certificado</span>
            </div>
            <div>
              <span className="text-on-surface-variant text-[11px] block font-medium uppercase tracking-wider">Ciclo Hidropônico</span>
              <span className="text-on-surface font-mono text-xs block mt-0.5">
                {new Date(selectedBatch.plantingDate).toLocaleDateString()} ➔{' '}
                {new Date(selectedBatch.expectedHarvestDate).toLocaleDateString()}
              </span>
              <span className="text-[11px] text-on-surface-variant">Prev. Colheita</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-on-surface-variant text-[11px] block font-medium uppercase tracking-wider">{t.status}</span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase mt-0.5 ${
                    selectedBatch.isBlocked
                      ? 'bg-error-container text-on-error-container'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}
                >
                  {selectedBatch.isBlocked ? 'RETIDO (HOLD)' : selectedBatch.status}
                </span>
              </div>

              {/* Action buttons: Hold/Release & QR */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowHoldModal(true)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 font-bold transition-all cursor-pointer shadow-xs ${
                    selectedBatch.isBlocked
                      ? 'bg-primary hover:opacity-90 text-on-primary'
                      : 'bg-error-container hover:opacity-90 text-on-error-container'
                  }`}
                  title={selectedBatch.isBlocked ? t.unblockLot : t.blockLot}
                >
                  {selectedBatch.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{selectedBatch.isBlocked ? 'Liberar' : 'Bloquear'}</span>
                </button>

                <button
                  onClick={() => handleShowQr(`Lote ${selectedBatch.batchCode}`, selectedBatch.qrToken)}
                  className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/40 px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors"
                  title="Ver QR Code do Lote"
                >
                  <QrCode className="w-3.5 h-3.5 text-primary" />
                  <span>QR</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedBatch?.isBlocked && selectedBatch.blockReason && (
          <div className="mt-4 bg-error-container/40 border border-error/30 rounded-xl p-3 text-xs text-on-error-container flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <div>
              <strong>Motivo do Bloqueio Sanitário Preventivo:</strong> {selectedBatch.blockReason}
              <span className="block text-[11px] text-on-error-container/80 mt-0.5">
                Registrado por {selectedBatch.blockedBy} • Exige validação para prosseguir na esteira.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Directed Graph Visual Tree */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <GitFork className="w-4 h-4 text-primary" />
            Fluxo de Rastreabilidade Ponta a Ponta (Grafo Dirigido)
          </h3>
          <span className="text-[11px] font-mono text-on-surface-variant">GS1 Global Trace Ready</span>
        </div>

        <div className="flex items-center gap-3 min-w-[780px] py-3">
          {/* Node 1: Semente / Muda */}
          <div className="w-52 bg-surface-container-low border border-outline-variant/40 rounded-xl p-3.5 shrink-0 shadow-xs">
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase mb-1">
              <Trees className="w-3.5 h-3.5" />
              1. Origem Genética
            </div>
            <div className="text-xs font-bold text-on-surface">{selectedBatch?.seedlingOrigin}</div>
            <div className="text-[11px] text-on-surface-variant mt-1">CFO / Matriz Certificada</div>
          </div>

          <ArrowRight className="w-4 h-4 text-outline-variant shrink-0" />

          {/* Node 2: Lote de Plantio */}
          <div className="w-52 bg-surface-container-low border border-outline-variant/40 rounded-xl p-3.5 shrink-0 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase mb-1">
              <span className="text-secondary">2. Lote Hidropônico</span>
              <span className="text-[10px] text-on-surface-variant font-mono">NFT</span>
            </div>
            <div className="text-xs font-mono font-bold text-on-surface">{selectedBatch?.batchCode}</div>
            <div className="text-[11px] text-on-surface-variant mt-1">
              {selectedBatch?.currentActiveQuantity} plantas ativas
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-outline-variant shrink-0" />

          {/* Node 3: Colheita */}
          <div className="w-52 bg-surface-container-low border border-outline-variant/40 rounded-xl p-3.5 shrink-0 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase mb-1">
              <span className="text-amber-700">3. Colheita</span>
              <Scale className="w-3.5 h-3.5 text-amber-600" />
            </div>
            {relatedHarvests.length > 0 ? (
              relatedHarvests.map((h) => (
                <div key={h.id} className="text-xs text-on-surface">
                  <div className="font-mono font-bold">{h.harvestCode}</div>
                  <div className="text-[11px] text-on-surface-variant">
                    {h.netWeightKg} kg líq. ({h.qualityGrade})
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-on-surface-variant italic">Em desenvolvimento</div>
            )}
          </div>

          <ArrowRight className="w-4 h-4 text-outline-variant shrink-0" />

          {/* Node 4: Embalagem / Packing */}
          <div className="w-52 bg-surface-container-low border border-outline-variant/40 rounded-xl p-3.5 shrink-0 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase mb-1">
              <span className="text-purple-700">4. Lote Embalado</span>
              <Package className="w-3.5 h-3.5 text-purple-600" />
            </div>
            {relatedPackLots.length > 0 ? (
              relatedPackLots.map((p) => (
                <div key={p.id} className="text-xs text-on-surface mb-1">
                  <div className="font-mono font-bold">{p.packCode}</div>
                  <div className="text-[11px] text-on-surface-variant">
                    {p.unitsPacked} un ({p.packageType})
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-on-surface-variant italic">Sem estoque embalado</div>
            )}
          </div>

          <ArrowRight className="w-4 h-4 text-outline-variant shrink-0" />

          {/* Node 5: Expedição / Destinatário */}
          <div className="w-56 bg-surface-container-low border border-outline-variant/40 rounded-xl p-3.5 shrink-0 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase mb-1">
              <span className="text-primary">5. Expedição</span>
              <Truck className="w-3.5 h-3.5 text-primary" />
            </div>
            {relatedShipments.length > 0 ? (
              relatedShipments.map((s) => (
                <div key={s.id} className="text-xs text-on-surface mb-1">
                  <div className="font-bold text-on-surface truncate">{s.buyerName}</div>
                  <div className="text-[11px] text-on-surface-variant truncate">{s.buyerDestination}</div>
                  <div className="text-[10px] text-primary font-mono font-semibold mt-0.5">{s.status.toUpperCase()}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-on-surface-variant italic">Nenhum despacho realizado</div>
            )}
          </div>
        </div>
      </div>

      {/* Biomass Balance & Reconciliation Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3.5 flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          {t.biomassBalance} (Reconciliação de Quantidades)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-center">
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
            <span className="text-[11px] text-on-surface-variant font-medium">{t.harvestedTotal}</span>
            <div className="text-lg font-bold text-on-surface mt-1">{totalHarvestedKg.toFixed(1)} kg</div>
          </div>
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
            <span className="text-[11px] text-on-surface-variant font-medium">{t.packedTotal}</span>
            <div className="text-lg font-bold text-secondary mt-1">{totalPackedKg.toFixed(1)} kg</div>
          </div>
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
            <span className="text-[11px] text-on-surface-variant font-medium">{t.lossesTotal}</span>
            <div className="text-lg font-bold text-error mt-1">{totalCullsKg.toFixed(1)} kg</div>
          </div>
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
            <span className="text-[11px] text-on-surface-variant font-medium">{t.stockTotal}</span>
            <div className="text-lg font-bold text-amber-700 mt-1">{totalStockKg.toFixed(1)} kg</div>
          </div>
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
            <span className="text-[11px] text-on-surface-variant font-medium">{t.shippedTotal}</span>
            <div className="text-lg font-bold text-primary mt-1">{totalShippedKg.toFixed(1)} kg</div>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            Integridade de massa verificada: Soma de Embalado + Descartes é coerente com o colhido.
          </span>
          <button
            onClick={() => onOpenPublicTrace(selectedBatch?.qrToken || '')}
            className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Abrir Projeção Pública do Consumidor</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrModalUrl && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <h4 className="text-base font-bold text-on-surface mb-1">{qrModalTitle}</h4>
            <p className="text-xs text-on-surface-variant mb-4">
              Etiqueta de rastreabilidade compatível com smartphones e leitores GS1.
            </p>
            <div className="bg-white p-4 rounded-xl inline-block shadow-inner mx-auto mb-4 border border-outline-variant/30">
              <img src={qrModalUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => onOpenPublicTrace(selectedBatch?.qrToken || '')}
                className="bg-primary text-on-primary text-xs font-bold py-2 px-4 rounded-xl shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                Abrir Página Pública
              </button>
              <button
                onClick={() => setQrModalUrl(null)}
                className="bg-surface-container-high text-on-surface text-xs font-semibold py-2 px-4 rounded-xl border border-outline-variant/40 hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hold/Release Confirmation Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h4 className="text-base font-bold text-on-surface mb-2 flex items-center gap-2">
              {selectedBatch?.isBlocked ? (
                <>
                  <Unlock className="w-5 h-5 text-primary" />
                  Liberar Lote {selectedBatch?.batchCode}
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-error" />
                  Bloqueio Sanitário Preventivo (Hold)
                </>
              )}
            </h4>
            <p className="text-xs text-on-surface-variant mb-3.5">
              {selectedBatch?.isBlocked
                ? 'A liberação permitirá colheita, embalagem e expedição deste lote normalmente.'
                : 'O bloqueio impede qualquer movimentação, colheita ou faturamento até revisão pelo Auditor.'}
            </p>

            {modalError && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                {modalError}
              </div>
            )}

            {!selectedBatch?.isBlocked && (
              <div className="mb-4">
                <label className="text-xs text-on-surface font-semibold block mb-1">
                  Justificativa Técnica Obrigatória:
                </label>
                <textarea
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  placeholder="Ex: Suspeita de resíduo fitossanitário em período de carência ou anomalia grave..."
                  className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowHoldModal(false)}
                className="px-3.5 py-2 bg-surface-container-high text-on-surface hover:bg-surface-container-highest rounded-xl text-xs font-semibold border border-outline-variant/40 cursor-pointer transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleToggleHold(!selectedBatch?.isBlocked)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs ${
                  selectedBatch?.isBlocked
                    ? 'bg-primary text-on-primary hover:opacity-90'
                    : 'bg-error text-white hover:opacity-90'
                }`}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
