import React, { useState } from 'react';
import {
  Language,
  PlantBatch,
  HarvestRecord,
  PackLot,
  Shipment,
  UserProfile
} from '../types';
import { translations } from '../i18n/translations';
import { StorageService } from '../services/storageService';
import {
  AlertOctagon,
  Download,
  ShieldAlert,
  Building,
  Truck,
  Package,
  CheckCircle2,
  Lock,
  ArrowDown
} from 'lucide-react';

interface RecallSimulatorProps {
  lang: Language;
  batches: PlantBatch[];
  harvests: HarvestRecord[];
  packLots: PackLot[];
  shipments: Shipment[];
  currentUser: UserProfile;
  onRefreshData: () => void;
}

export const RecallSimulator: React.FC<RecallSimulatorProps> = ({
  lang,
  batches,
  harvests,
  packLots,
  shipments,
  currentUser,
  onRefreshData
}) => {
  const t = translations[lang];
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');
  const [isLockedDown, setIsLockedDown] = useState(false);

  const targetBatch = batches.find((b) => b.id === selectedBatchId);

  // Downstream impact calculation
  const affectedHarvests = harvests.filter((h) => h.batchId === targetBatch?.id);
  const affectedPacks = packLots.filter((p) =>
    affectedHarvests.some((h) => h.id === p.harvestBatchId) || p.harvestBatchId === targetBatch?.id
  );
  const affectedShipments = shipments.filter((s) =>
    s.lines.some((l) => affectedPacks.some((p) => p.id === l.packLotId))
  );

  const affectedBuyers = Array.from(new Set(affectedShipments.map((s) => s.buyerName)));
  const totalBoxesInStock = affectedPacks
    .filter((p) => p.status === 'in_stock' || p.status === 'allocated')
    .reduce((sum, p) => sum + p.unitsPacked, 0);
  const totalBoxesShipped = affectedShipments.reduce(
    (sum, s) =>
      sum +
      s.lines
        .filter((l) => affectedPacks.some((p) => p.id === l.packLotId))
        .reduce((lSum, l) => lSum + l.quantityBoxes, 0),
    0
  );

  const handleExecuteEmergencyLockdown = () => {
    if (!targetBatch) return;

    // Apply hold to batch
    StorageService.setBatchBlock(
      targetBatch.id,
      true,
      'SIMULAÇÃO DE RECALL / CONTENÇÃO FITOSSANITÁRIA IMEDIATA',
      { name: currentUser.name, role: currentUser.role, email: currentUser.email }
    );

    // Mark affected pack lots as recalled
    const allPacks = StorageService.getPackLots();
    allPacks.forEach((p) => {
      if (affectedPacks.some((ap) => ap.id === p.id)) {
        p.status = 'recalled';
      }
    });
    StorageService.savePackLots(allPacks);

    StorageService.appendAudit(
      currentUser.email,
      currentUser.role,
      'EMERGENCY_RECALL_EXECUTED',
      'Recall',
      targetBatch.id,
      `Recall simulado executado para ${targetBatch.batchCode}. ${affectedBuyers.length} compradores listados e ${totalBoxesInStock} caixas imobilizadas.`
    );

    setIsLockedDown(true);
    onRefreshData();
  };

  const handleDownloadManifest = () => {
    const manifest = {
      auditTitle: 'Protocolo de Retirada de Mercado (Recall) - Coop Agronorte',
      generatedAt: new Date().toISOString(),
      auditor: `${currentUser.name} (${currentUser.role})`,
      targetBatch: {
        code: targetBatch?.batchCode,
        crop: targetBatch?.crop,
        cultivar: targetBatch?.cultivar,
        seedlingOrigin: targetBatch?.seedlingOrigin
      },
      impactAssessment: {
        totalHarvestsAffected: affectedHarvests.length,
        totalPackLotsAffected: affectedPacks.length,
        boxesInStockToHold: totalBoxesInStock,
        boxesInTransitOrDelivered: totalBoxesShipped,
        buyersToNotify: affectedBuyers
      },
      affectedShipments: affectedShipments.map((s) => ({
        shipmentCode: s.shipmentCode,
        buyer: s.buyerName,
        destination: s.buyerDestination,
        vehiclePlate: s.transportVehiclePlate,
        driver: s.driverName,
        date: s.shippedAt
      })),
      complianceStandard: 'SENAVE / BPA-PY / GLOBALG.A.P. Procedimento CB.5.2.1',
      cryptographicHash: `sha256_${Date.now().toString(16)}`
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `RECALL_MANIFEST_${targetBatch?.batchCode || 'LOTE'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-error-container text-on-error-container flex items-center justify-center shadow-xs">
                <AlertOctagon className="w-4 h-4 text-error" />
              </span>
              <h2 className="text-base font-bold text-on-surface">
                {t.recallTitle}
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">{t.recallDesc}</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-on-surface-variant font-semibold">Lote em Investigação:</label>
            <select
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
                setIsLockedDown(false);
              }}
              className="bg-surface-container-high border border-outline-variant/40 text-on-surface text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono font-bold cursor-pointer"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchCode} ({b.crop})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Impact Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Affected Buyers */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3 text-on-surface-variant">
            <span className="text-xs font-bold uppercase tracking-wider">{t.affectedBuyers}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-on-surface tracking-tight font-mono">{affectedBuyers.length}</div>
          <div className="mt-3 space-y-1.5">
            {affectedBuyers.length > 0 ? (
              affectedBuyers.map((b, idx) => (
                <div key={idx} className="text-xs text-on-surface bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 font-medium">
                  {b}
                </div>
              ))
            ) : (
              <span className="text-xs text-on-surface-variant italic">Nenhum comprador afetado (lote não expedido)</span>
            )}
          </div>
        </div>

        {/* Affected Inventory In Warehouse */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3 text-on-surface-variant">
            <span className="text-xs font-bold uppercase tracking-wider">{t.affectedInventory}</span>
            <div className="w-8 h-8 rounded-xl bg-error-container text-on-error-container flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-error tracking-tight font-mono">{totalBoxesInStock} cx</div>
          <div className="mt-3 space-y-1.5">
            {affectedPacks.map((p) => (
              <div key={p.id} className="text-xs text-on-surface bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 flex justify-between font-medium">
                <span className="font-mono font-bold">{p.packCode}</span>
                <span className="text-on-surface-variant">{p.storageLocation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Boxes In Transit / External */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3 text-on-surface-variant">
            <span className="text-xs font-bold uppercase tracking-wider">Cajas em Trânsito / Clientes</span>
            <div className="w-8 h-8 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-on-surface tracking-tight font-mono">{totalBoxesShipped} cx</div>
          <div className="mt-3 space-y-1.5">
            {affectedShipments.map((s) => (
              <div key={s.id} className="text-xs text-on-surface bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30">
                <div className="font-bold font-mono">{s.shipmentCode}</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">Placa: {s.transportVehiclePlate} ({s.driverName})</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Controls and Manifest Export */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div>
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-error" />
            Ações Imediatas de Contenção e Conformidade
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Gera relatório de auditoria e executa o bloqueio de segurança em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExecuteEmergencyLockdown}
            className="bg-error hover:opacity-90 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Executar Bloqueio Preventivo</span>
          </button>

          <button
            onClick={handleDownloadManifest}
            className="bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>{t.exportAuditManifest}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
