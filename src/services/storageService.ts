import {
  PlantBatch,
  HarvestRecord,
  PackLot,
  LotLink,
  Shipment,
  Alert,
  FieldInspection,
  AuditEntry,
  ComplianceItem,
  ProductionZone,
  InputItem,
  InputMovement,
  NutrientRecipe,
  FertigationLog,
  UserProfile
} from '../types';
import {
  INITIAL_BATCHES,
  INITIAL_HARVESTS,
  INITIAL_PACK_LOTS,
  INITIAL_LOT_LINKS,
  INITIAL_SHIPMENTS,
  INITIAL_ALERTS,
  INITIAL_INSPECTIONS,
  INITIAL_AUDIT_LOG,
  INITIAL_COMPLIANCE,
  INITIAL_ZONES,
  INITIAL_INPUT_ITEMS,
  INITIAL_INPUT_MOVEMENTS,
  INITIAL_RECIPES,
  INITIAL_FERTIGATION_LOGS,
  SEED_TENANT
} from '../data/seedData';

const STORAGE_KEYS = {
  BATCHES: 'agronorte_batches_v2',
  HARVESTS: 'agronorte_harvests_v2',
  PACK_LOTS: 'agronorte_packlots_v2',
  LOT_LINKS: 'agronorte_lotlinks_v2',
  SHIPMENTS: 'agronorte_shipments_v2',
  ALERTS: 'agronorte_alerts_v2',
  INSPECTIONS: 'agronorte_inspections_v2',
  AUDIT: 'agronorte_audit_v2',
  COMPLIANCE: 'agronorte_compliance_v2',
  ZONES: 'agronorte_zones_v2',
  OUTBOX: 'agronorte_outbox_v2',
  INPUT_ITEMS: 'agronorte_input_items_v2',
  INPUT_MOVEMENTS: 'agronorte_input_movements_v2',
  RECIPES: 'agronorte_recipes_v2',
  FERTIGATION_LOGS: 'agronorte_fertigation_logs_v2'
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage quota or access error:', err);
  }
}

// Simple hash simulation for audit chain
function computeHash(dataString: string): string {
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256_${hex}${Date.now().toString(16)}`;
}

export class StorageService {
  static getZones(): ProductionZone[] {
    return getLocal(STORAGE_KEYS.ZONES, INITIAL_ZONES);
  }

  static saveZones(zones: ProductionZone[]): void {
    setLocal(STORAGE_KEYS.ZONES, zones);
  }

  static getBatches(): PlantBatch[] {
    const list = getLocal<PlantBatch[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    if (!Array.isArray(list)) return INITIAL_BATCHES;
    return list.map((b: any) => ({
      ...b,
      isBlocked: !!b.isBlocked,
      status: b.status || (b.isBlocked ? 'quarantine' : 'active')
    }));
  }

  static saveBatches(batches: PlantBatch[]): void {
    setLocal(STORAGE_KEYS.BATCHES, batches);
  }

  static getHarvests(): HarvestRecord[] {
    const list = getLocal<HarvestRecord[]>(STORAGE_KEYS.HARVESTS, INITIAL_HARVESTS);
    if (!Array.isArray(list)) return INITIAL_HARVESTS;
    return list.map((h: any) => ({
      ...h,
      cullsKg: h.cullsKg ?? h.cullWeightKg ?? 0,
      isLocked: !!h.isLocked
    }));
  }

  static saveHarvests(harvests: HarvestRecord[]): void {
    setLocal(STORAGE_KEYS.HARVESTS, harvests);
  }

  static getPackLots(): PackLot[] {
    const list = getLocal<PackLot[]>(STORAGE_KEYS.PACK_LOTS, INITIAL_PACK_LOTS);
    if (!Array.isArray(list)) return INITIAL_PACK_LOTS;
    return list.map((p: any) => ({
      ...p,
      unitsPacked: p.unitsPacked ?? 0,
      totalWeightKg: p.totalWeightKg ?? 0,
      status: p.status || 'in_stock'
    }));
  }

  static savePackLots(packLots: PackLot[]): void {
    setLocal(STORAGE_KEYS.PACK_LOTS, packLots);
  }

  static getLotLinks(): LotLink[] {
    const list = getLocal<LotLink[]>(STORAGE_KEYS.LOT_LINKS, INITIAL_LOT_LINKS);
    return Array.isArray(list) ? list : INITIAL_LOT_LINKS;
  }

  static saveLotLinks(links: LotLink[]): void {
    setLocal(STORAGE_KEYS.LOT_LINKS, links);
  }

  static getShipments(): Shipment[] {
    const list = getLocal<Shipment[]>(STORAGE_KEYS.SHIPMENTS, INITIAL_SHIPMENTS);
    if (!Array.isArray(list)) return INITIAL_SHIPMENTS;
    return list.map((s: any) => ({
      ...s,
      lines: Array.isArray(s.lines)
        ? s.lines
        : Array.isArray(s.items)
        ? s.items.map((it: any, idx: number) => ({
            id: `line-${idx}-${Date.now()}`,
            tenantId: s.tenantId || 'tenant-agronorte-demo',
            shipmentId: s.id,
            packLotId: it.packLotId || '',
            quantityBoxes: it.quantityBoxes || it.boxes || 1,
            totalKg: it.totalKg || it.weightKg || 0
          }))
        : []
    }));
  }

  static saveShipments(shipments: Shipment[]): void {
    setLocal(STORAGE_KEYS.SHIPMENTS, shipments);
  }

  static getAlerts(): Alert[] {
    return getLocal(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
  }

  static saveAlerts(alerts: Alert[]): void {
    setLocal(STORAGE_KEYS.ALERTS, alerts);
  }

  static getInspections(): FieldInspection[] {
    return getLocal(STORAGE_KEYS.INSPECTIONS, INITIAL_INSPECTIONS);
  }

  static saveInspections(inspections: FieldInspection[]): void {
    setLocal(STORAGE_KEYS.INSPECTIONS, inspections);
  }

  static addInspection(inspection: FieldInspection, user: UserProfile): void {
    const list = this.getInspections();
    list.unshift(inspection);
    this.saveInspections(list);
    this.appendAudit(
      user.id,
      user.role,
      'create_field_inspection',
      'inspection',
      inspection.id,
      `Apontamento manual: ${inspection.templateType} na zona ${inspection.zoneId} (pH: ${inspection.phManual ?? '-'}, EC: ${inspection.ecManual ?? '-'})`
    );
  }

  static getAuditLog(): AuditEntry[] {
    return getLocal(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOG);
  }

  static appendAudit(
    userId: string,
    userRole: string,
    action: string,
    entity: string,
    entityId: string,
    details: string
  ): void {
    const logs = this.getAuditLog();
    const lastHash = logs.length > 0 ? logs[logs.length - 1].currentHash : 'GENESIS_HASH';
    const newEntry: AuditEntry = {
      id: `aud-${Date.now()}`,
      tenantId: SEED_TENANT.id,
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      action,
      entity,
      entityId,
      details,
      previousHash: lastHash,
      currentHash: computeHash(`${lastHash}_${action}_${entityId}_${Date.now()}`)
    };
    logs.push(newEntry);
    setLocal(STORAGE_KEYS.AUDIT, logs);
  }

  static getCompliance(): ComplianceItem[] {
    return getLocal(STORAGE_KEYS.COMPLIANCE, INITIAL_COMPLIANCE);
  }

  // === GESTÃO DE INSUMOS & FERTIRRIGAÇÃO ===

  static getInputItems(): InputItem[] {
    return getLocal(STORAGE_KEYS.INPUT_ITEMS, INITIAL_INPUT_ITEMS);
  }

  static saveInputItems(items: InputItem[]): void {
    setLocal(STORAGE_KEYS.INPUT_ITEMS, items);
  }

  static getInputMovements(): InputMovement[] {
    return getLocal(STORAGE_KEYS.INPUT_MOVEMENTS, INITIAL_INPUT_MOVEMENTS);
  }

  static saveInputMovements(movements: InputMovement[]): void {
    setLocal(STORAGE_KEYS.INPUT_MOVEMENTS, movements);
  }

  static addInputMovement(movement: InputMovement): void {
    const movements = this.getInputMovements();
    movements.push(movement);
    this.saveInputMovements(movements);

    // Update stock quantity
    const items = this.getInputItems();
    const item = items.find(i => i.id === movement.inputItemId);
    if (item) {
      if (movement.type === 'entrada') {
        item.currentStockQty += movement.quantity;
      } else if (movement.type === 'saida' || movement.type === 'perda') {
        item.currentStockQty = Math.max(0, item.currentStockQty - movement.quantity);
      }
      this.saveInputItems(items);
    }
  }

  static getRecipes(): NutrientRecipe[] {
    return getLocal(STORAGE_KEYS.RECIPES, INITIAL_RECIPES);
  }

  static saveRecipes(recipes: NutrientRecipe[]): void {
    setLocal(STORAGE_KEYS.RECIPES, recipes);
  }

  static getFertigationLogs(): FertigationLog[] {
    return getLocal(STORAGE_KEYS.FERTIGATION_LOGS, INITIAL_FERTIGATION_LOGS);
  }

  static saveFertigationLogs(logs: FertigationLog[]): void {
    setLocal(STORAGE_KEYS.FERTIGATION_LOGS, logs);
  }

  static addFertigationLog(log: FertigationLog): void {
    const logs = this.getFertigationLogs();
    logs.push(log);
    this.saveFertigationLogs(logs);
  }

  // Outbox for Offline-First operations
  static getOutbox(): any[] {
    return getLocal(STORAGE_KEYS.OUTBOX, []);
  }

  static addToOutbox(op: any): void {
    const outbox = this.getOutbox();
    outbox.push(op);
    setLocal(STORAGE_KEYS.OUTBOX, outbox);
  }

  static clearOutbox(): void {
    setLocal(STORAGE_KEYS.OUTBOX, []);
  }

  // Block / Unblock batch with rule verification
  static setBatchBlock(
    batchId: string,
    blocked: boolean,
    reason: string,
    user: { name: string; role: string; email: string }
  ): { success: boolean; message: string } {
    // Only quality_auditor or agronomist or tenant_admin can block/unblock
    const allowedRoles = ['quality_auditor', 'agronomist', 'tenant_admin', 'farm_manager'];
    if (!allowedRoles.includes(user.role)) {
      return {
        success: false,
        message: 'Permissão negada: Somente Auditor de Qualidade ou Agrônomo pode alterar bloqueio sanitário/Hold.'
      };
    }

    const batches = this.getBatches();
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return { success: false, message: 'Lote não encontrado.' };

    batch.isBlocked = blocked;
    batch.status = blocked ? 'quarantine' : 'active';
    if (blocked) {
      batch.blockReason = reason;
      batch.blockedBy = `${user.name} (${user.role})`;
      batch.blockedAt = new Date().toISOString();
    } else {
      batch.unblockedBy = `${user.name} (${user.role})`;
      batch.unblockedAt = new Date().toISOString();
    }

    this.saveBatches(batches);
    this.appendAudit(
      user.email,
      user.role,
      blocked ? 'BATCH_HOLD_APPLIED' : 'BATCH_RELEASE_GRANTED',
      'PlantBatch',
      batchId,
      `Lote ${batch.batchCode} alterado para ${blocked ? 'BLOQUEADO' : 'LIBERADO'}. Motivo: ${reason}`
    );

    return { success: true, message: `Lote ${batch.batchCode} atualizado com sucesso.` };
  }

  // Reset demo state
  static resetToSeed(): void {
    localStorage.removeItem(STORAGE_KEYS.BATCHES);
    localStorage.removeItem(STORAGE_KEYS.HARVESTS);
    localStorage.removeItem(STORAGE_KEYS.PACK_LOTS);
    localStorage.removeItem(STORAGE_KEYS.LOT_LINKS);
    localStorage.removeItem(STORAGE_KEYS.SHIPMENTS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.INSPECTIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.COMPLIANCE);
    localStorage.removeItem(STORAGE_KEYS.ZONES);
    localStorage.removeItem(STORAGE_KEYS.OUTBOX);
    localStorage.removeItem(STORAGE_KEYS.INPUT_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.INPUT_MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.RECIPES);
    localStorage.removeItem(STORAGE_KEYS.FERTIGATION_LOGS);
  }
}
