import React, { useState } from 'react';
import {
  Language,
  HarvestRecord,
  PackLot,
  PlantBatch,
  UserProfile,
  QualityGrade
} from '../types';
import { translations } from '../i18n/translations';
import { StorageService } from '../services/storageService';
import { QRService } from '../services/qrService';
import {
  Package,
  Scale,
  Plus,
  QrCode,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertOctagon,
  ArrowRight,
  X
} from 'lucide-react';

interface HarvestAndPackingProps {
  lang: Language;
  harvests: HarvestRecord[];
  packLots: PackLot[];
  batches: PlantBatch[];
  currentUser: UserProfile;
  onRefreshData: () => void;
  onOpenPublicTrace: (token: string) => void;
}

export const HarvestAndPacking: React.FC<HarvestAndPackingProps> = ({
  lang,
  harvests,
  packLots,
  batches,
  currentUser,
  onRefreshData,
  onOpenPublicTrace
}) => {
  const t = translations[lang];
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [showPackModal, setShowPackModal] = useState(false);

  // Harvest Form state
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');
  const [grossWeight, setGrossWeight] = useState<string>('420.0');
  const [tareWeight, setTareWeight] = useState<string>('15.0');
  const [cullsKg, setCullsKg] = useState<string>('8.5');
  const [unitsCount, setUnitsCount] = useState<string>('3200');
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('extra');
  const [brixDegree, setBrixDegree] = useState<string>('5.4');
  const [cullReason, setCullReason] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Packing Form state
  const [selectedHarvestId, setSelectedHarvestId] = useState(harvests[0]?.id || '');
  const [packageType, setPackageType] = useState<PackLot['packageType']>('Caixa 10kg');
  const [unitsPacked, setUnitsPacked] = useState<string>('40');
  const [storageLocation, setStorageLocation] = useState<string>('Câmara Fria 01 - Pallet A3');

  const handleCreateHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find((b) => b.id === selectedBatchId);
    if (!batch) return;

    if (batch.isBlocked) {
      setFormError('Bloqueio ativo: Este lote está em quarentena técnica sanitária!');
      return;
    }
    setFormError(null);

    const gross = parseFloat(grossWeight) || 0;
    const tare = parseFloat(tareWeight) || 0;
    const culls = parseFloat(cullsKg) || 0;
    const net = Math.max(0, gross - tare - culls);

    const newHarvest: HarvestRecord = {
      id: `harv-${Date.now()}`,
      tenantId: 'tenant-agronorte-demo',
      harvestCode: `COL-${batch.batchCode.replace('LOT-', '')}-${Date.now().toString().slice(-4)}`,
      batchId: batch.id,
      harvestedAt: new Date().toISOString(),
      operatorId: currentUser.name,
      grossWeightKg: gross,
      tareWeightKg: tare,
      cullsKg: culls,
      netWeightKg: net,
      unitsCount: parseInt(unitsCount) || 0,
      qualityGrade,
      brixDegree: parseFloat(brixDegree) || undefined,
      cullReason: cullReason || undefined,
      isLocked: false
    };

    const currentHarvests = StorageService.getHarvests();
    currentHarvests.unshift(newHarvest);
    StorageService.saveHarvests(currentHarvests);

    StorageService.appendAudit(
      currentUser.email,
      currentUser.role,
      'HARVEST_RECORDED',
      'HarvestRecord',
      newHarvest.id,
      `Colheita ${newHarvest.harvestCode} registrada: ${net.toFixed(1)} kg líquidos obtidos do lote ${batch.batchCode}`
    );

    setShowHarvestModal(false);
    onRefreshData();
  };

  const handleCreatePackLot = (e: React.FormEvent) => {
    e.preventDefault();
    const harvest = harvests.find((h) => h.id === selectedHarvestId);
    if (!harvest) return;

    const units = parseInt(unitsPacked) || 0;
    const weightPerBox = packageType === 'Caixa 10kg' ? 10 : packageType === 'Caixa 20kg' ? 20 : 0.5;
    const totalKg = units * weightPerBox;

    const qrToken = `qr_pack_${Date.now().toString(16)}`;

    const newPack: PackLot = {
      id: `pack-${Date.now()}`,
      tenantId: 'tenant-agronorte-demo',
      packCode: `EMB-${harvest.harvestCode.replace('COL-', '')}-${units}CX`,
      harvestBatchId: harvest.id,
      packageType,
      unitsPacked: units,
      totalWeightKg: totalKg,
      packedAt: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      qualityAuditorApproved: true,
      auditorId: currentUser.name,
      qrToken,
      status: 'in_stock',
      storageLocation
    };

    const currentPacks = StorageService.getPackLots();
    currentPacks.unshift(newPack);
    StorageService.savePackLots(currentPacks);

    // Record lot link
    const links = StorageService.getLotLinks();
    links.push({
      id: `link-${Date.now()}`,
      tenantId: 'tenant-agronorte-demo',
      sourceBatchId: harvest.id,
      targetBatchId: newPack.id,
      type: 'embalagem',
      quantity: units,
      unit: 'caixas',
      timestamp: new Date().toISOString(),
      operatorId: currentUser.name
    });
    StorageService.saveLotLinks(links);

    StorageService.appendAudit(
      currentUser.email,
      currentUser.role,
      'PACK_LOT_CREATED',
      'PackLot',
      newPack.id,
      `Lote embalado ${newPack.packCode} gerado: ${units} caixas (${totalKg} kg) a partir da colheita ${harvest.harvestCode}`
    );

    setShowPackModal(false);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header and Actions */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <Scale className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-on-surface">
              {t.harvestTitle} & Empacotamento
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Registro de pesagem com tara, controle de perdas/descartes e empacotamento com rastreabilidade GS1.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowHarvestModal(true)}
            className="bg-primary hover:opacity-90 text-on-primary text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.newHarvest}
          </button>
          <button
            onClick={() => setShowPackModal(true)}
            className="bg-secondary-container hover:opacity-90 text-on-secondary-container text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Package className="w-4 h-4" />
            {t.packLotTitle}
          </button>
        </div>
      </div>

      {/* Harvest Records List */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            Lotes de Colheita Registrados
          </h3>
          <span className="text-xs text-on-surface-variant font-mono">{harvests.length} registros</span>
        </div>

        <div className="divide-y divide-outline-variant/20">
          {harvests.map((h) => {
            const parentBatch = batches.find((b) => b.id === h.batchId);
            return (
              <div key={h.id} className="p-5 hover:bg-surface-container-low/40 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-on-surface">{h.harvestCode}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-secondary-container text-on-secondary-container">
                        {h.qualityGrade}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Lote de Origem: <strong className="text-on-surface font-mono">{parentBatch?.batchCode}</strong> ({parentBatch?.crop})
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-on-surface-variant block text-[10px]">PESO LÍQUIDO</span>
                      <strong className="text-primary text-sm font-bold">{h.netWeightKg.toFixed(1)} kg</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-on-surface-variant block text-[10px]">REFUGO/DESCARTE</span>
                      <strong className="text-error text-sm font-bold">{(h.cullsKg || 0).toFixed(1)} kg</strong>
                    </div>
                    {h.brixDegree && (
                      <div className="text-right">
                        <span className="text-on-surface-variant block text-[10px]">GRAU BRIX</span>
                        <strong className="text-amber-700 text-sm font-bold">{h.brixDegree}° Bx</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-on-surface-variant flex items-center justify-between pt-1">
                  <span>Operador: {h.operatorId}</span>
                  <span>Data: {new Date(h.harvestedAt).toLocaleString('es-PY', { timeZone: 'America/Asuncion' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pack Lots in Stock List */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-secondary" />
            Lotes Comerciais Embalados (Estoque Acabado)
          </h3>
          <span className="text-xs text-on-surface-variant font-mono">{packLots.length} lotes embalados</span>
        </div>

        <div className="divide-y divide-outline-variant/20">
          {packLots.map((p) => (
            <div key={p.id} className="p-5 hover:bg-surface-container-low/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-on-surface">{p.packCode}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.status === 'in_stock'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : p.status === 'allocated'
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  {p.packageType} | Armazenamento: <span className="text-on-surface font-medium">{p.storageLocation}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-xs">
                  <span className="text-on-surface-variant block text-[10px]">QUANTIDADE</span>
                  <span className="font-bold text-on-surface text-sm">{p.unitsPacked} cx</span>
                  <span className="text-on-surface-variant text-[11px] block font-mono">({p.totalWeightKg} kg)</span>
                </div>

                <button
                  onClick={() => onOpenPublicTrace(p.qrToken)}
                  className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-primary" />
                  <span>Ver Rastreio</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: New Harvest */}
      {showHarvestModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                {t.newHarvest}
              </h3>
              <button onClick={() => setShowHarvestModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHarvest} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                  Selecione o Lote Produtivo
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.isBlocked}>
                      {b.batchCode} ({b.crop}) {b.isBlocked ? ' - [BLOQUEADO/HOLD]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                    {t.grossWeight}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface"
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                    {t.tareWeight}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                    Perdas / Descartes (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={cullsKg}
                    onChange={(e) => setCullsKg(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface"
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                    {t.qualityGrade}
                  </label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface"
                  >
                    <option value="extra">Extra (Sem defeitos)</option>
                    <option value="primeira">Primeira (Defeitos leves)</option>
                    <option value="segunda">Segunda</option>
                    <option value="industria">Indústria</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHarvestModal(false)}
                  className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-xs font-semibold border border-outline-variant/40 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:opacity-90 text-on-primary rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Salvar Colheita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Pack Lot */}
      {showPackModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Package className="w-5 h-5 text-secondary" />
                {t.packLotTitle}
              </h3>
              <button onClick={() => setShowPackModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackLot} className="space-y-4">
              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                  Vincular a Lote de Colheita
                </label>
                <select
                  value={selectedHarvestId}
                  onChange={(e) => setSelectedHarvestId(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface"
                >
                  {harvests.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.harvestCode} ({h.netWeightKg} kg líq. - {h.qualityGrade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                    {t.boxType}
                  </label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value as any)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface"
                  >
                    <option value="Caixa 10kg">Caixa 10kg</option>
                    <option value="Caixa 20kg">Caixa 20kg</option>
                    <option value="Bandeja 500g">Bandeja 500g</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                    {t.unitsCount} de Caixas
                  </label>
                  <input
                    type="number"
                    value={unitsPacked}
                    onChange={(e) => setUnitsPacked(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                  Localização no Depósito / Câmara Fria
                </label>
                <input
                  type="text"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPackModal(false)}
                  className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-xs font-semibold border border-outline-variant/40 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-secondary-container hover:opacity-90 text-on-secondary-container rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Gerar Lote Embalado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
