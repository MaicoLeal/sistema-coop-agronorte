import React, { useState } from 'react';
import {
  Language,
  Shipment,
  PackLot,
  PlantBatch,
  UserProfile
} from '../types';
import { translations } from '../i18n/translations';
import { StorageService } from '../services/storageService';
import {
  Truck,
  Plus,
  Package,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  FileSpreadsheet,
  X
} from 'lucide-react';

interface InventoryAndShipmentsProps {
  lang: Language;
  shipments: Shipment[];
  packLots: PackLot[];
  batches: PlantBatch[];
  currentUser: UserProfile;
  onRefreshData: () => void;
}

export const InventoryAndShipments: React.FC<InventoryAndShipmentsProps> = ({
  lang,
  shipments,
  packLots,
  batches,
  currentUser,
  onRefreshData
}) => {
  const t = translations[lang];
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [buyerName, setBuyerName] = useState('Superseis / Retail S.A.');
  const [buyerDestination, setBuyerDestination] = useState('Centro Distribución Asunción');
  const [vehiclePlate, setVehiclePlate] = useState('AAPY-904');
  const [driverName, setDriverName] = useState('Rubén Domínguez');
  const [selectedPackLotId, setSelectedPackLotId] = useState(packLots[0]?.id || '');
  const [quantityBoxes, setQuantityBoxes] = useState('20');
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const pack = packLots.find((p) => p.id === selectedPackLotId);
    if (!pack) return;

    if (pack.status === 'recalled') {
      setFormError('DESPACHO BLOQUEADO: Este lote embalado está sob quarentena/recall e não pode ser expedido!');
      return;
    }

    const qty = parseInt(quantityBoxes) || 0;
    if (qty <= 0 || qty > pack.unitsPacked) {
      setFormError(`Quantidade inválida. Máximo disponível neste lote: ${pack.unitsPacked} caixas.`);
      return;
    }
    setFormError(null);

    const weightPerBox = pack.totalWeightKg / (pack.unitsPacked || 1);
    const totalWeightShipped = qty * weightPerBox;

    const shipmentId = `ship-${Date.now()}`;
    const newShipment: Shipment = {
      id: shipmentId,
      tenantId: 'tenant-agronorte-demo',
      shipmentCode: `DESP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`,
      shippedAt: new Date().toISOString(),
      buyerName,
      buyerDestination,
      transportVehiclePlate: vehiclePlate,
      driverName,
      status: 'in_transit',
      lines: [
        {
          id: `line-${Date.now()}`,
          tenantId: 'tenant-agronorte-demo',
          shipmentId,
          packLotId: pack.id,
          quantityBoxes: qty,
          totalKg: totalWeightShipped
        }
      ],
      qrVerificationToken: `qr_manifest_${Date.now().toString(16)}`
    };

    // Deduct or mark pack lot
    pack.unitsPacked -= qty;
    pack.totalWeightKg -= totalWeightShipped;
    if (pack.unitsPacked === 0) {
      pack.status = 'shipped';
    } else {
      pack.status = 'allocated';
    }

    const currentShipments = StorageService.getShipments();
    currentShipments.unshift(newShipment);
    StorageService.saveShipments(currentShipments);

    const currentPacks = StorageService.getPackLots();
    StorageService.savePackLots(currentPacks);

    StorageService.appendAudit(
      currentUser.email,
      currentUser.role,
      'SHIPMENT_DISPATCHED',
      'Shipment',
      newShipment.id,
      `Expedição ${newShipment.shipmentCode} despachada para ${buyerName} com ${qty} caixas do lote ${pack.packCode}.`
    );

    setShowDispatchModal(false);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <Truck className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-on-surface">
              {t.shipmentTitle}
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Controle de expedição para redes varejistas e emissão de guias com selo GS1.
          </p>
        </div>

        <button
          onClick={() => setShowDispatchModal(true)}
          className="bg-primary hover:opacity-90 text-on-primary text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t.newShipment}
        </button>
      </div>

      {/* Shipments List */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            Guias de Expedição Registradas
          </h3>
          <span className="text-xs text-on-surface-variant font-mono">{shipments.length} expedições</span>
        </div>

        <div className="divide-y divide-outline-variant/20">
          {shipments.map((s) => (
            <div key={s.id} className="p-5 hover:bg-surface-container-low/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-on-surface">{s.shipmentCode}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.status === 'delivered'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : s.status === 'in_transit'
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface mt-1">{s.buyerName}</h4>
                  <p className="text-xs text-on-surface-variant">{s.buyerDestination}</p>
                </div>

                <div className="text-right text-xs">
                  <div className="text-on-surface font-semibold">
                    Veículo: <span className="font-mono text-primary font-bold">{s.transportVehiclePlate}</span>
                  </div>
                  <div className="text-on-surface-variant mt-0.5">Motorista: {s.driverName}</div>
                  <div className="text-on-surface-variant mt-0.5 font-mono text-[11px]">
                    {new Date(s.shippedAt).toLocaleString('es-PY', { timeZone: 'America/Asuncion' })}
                  </div>
                </div>
              </div>

              {/* Lines summary */}
              <div className="mt-3.5 pt-3.5 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Package className="w-3.5 h-3.5 text-secondary" />
                  <span>
                    Conteúdo: <strong>{s.lines.reduce((sum, l) => sum + l.quantityBoxes, 0)} caixas</strong> (
                    {s.lines.reduce((sum, l) => sum + l.totalKg, 0).toFixed(1)} kg)
                  </span>
                </div>

                <span className="text-primary text-[11px] font-medium flex items-center gap-1.5 bg-primary-container/40 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Selo Fiscal Eletrônico Validado
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: New Shipment */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                {t.newShipment}
              </h3>
              <button onClick={() => setShowDispatchModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                  Lote Embalado em Estoque
                </label>
                <select
                  value={selectedPackLotId}
                  onChange={(e) => setSelectedPackLotId(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {packLots.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.status === 'recalled'}>
                      {p.packCode} ({p.unitsPacked} cx disponíveis) {p.status === 'recalled' ? ' - [BLOQUEADO]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                    {t.buyer}
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface"
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                    Destino / Cidade
                  </label>
                  <input
                    type="text"
                    value={buyerDestination}
                    onChange={(e) => setBuyerDestination(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                    Qtd Caixas
                  </label>
                  <input
                    type="number"
                    value={quantityBoxes}
                    onChange={(e) => setQuantityBoxes(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface"
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                    {t.vehiclePlate}
                  </label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                    {t.driver}
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-xs font-semibold border border-outline-variant/40 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:opacity-90 text-on-primary rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {t.confirmDispatch}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
