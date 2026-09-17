/**
 * Tipos centrais do Sistema Coop Agronorte de Gestão e Rastreabilidade Hidropônica
 */

export type Language = 'es-PY' | 'pt-BR';

export type UserRole =
  | 'platform_admin'
  | 'tenant_admin'
  | 'agronomist'
  | 'farm_manager'
  | 'field_operator'
  | 'packhouse_operator'
  | 'quality_auditor'
  | 'viewer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  unitScope?: string[];
  isDemo: boolean;
}

export type BatchStatus = 'active' | 'quarantine' | 'harvested' | 'packed' | 'shipped' | 'destroyed';
export type QualityGrade = 'extra' | 'primeira' | 'segunda' | 'industria' | 'descarte';

export interface ProductionZone {
  id: string;
  tenantId: string;
  name: string;
  type: 'greenhouse' | 'block' | 'sector' | 'bench' | 'line';
  parentId?: string;
  cropType: 'tomate' | 'locote';
  cultivar: string;
  systemType: 'NFT' | 'substrato' | 'semi-hidroponico';
  capacityPlants: number;
  activePlants: number;
}

export interface PlantBatch {
  id: string;
  tenantId: string;
  batchCode: string; // Ex: LOTE-TOM-2026-088
  zoneId: string;
  crop: 'Tomate Saladete' | 'Locote Verde/Vermelho';
  cultivar: string;
  seedlingOrigin: string; // Fornecedor / Lote da muda
  plantingDate: string; // UTC ISO
  expectedHarvestDate: string;
  initialQuantity: number;
  currentActiveQuantity: number;
  status: BatchStatus;
  isBlocked: boolean;
  blockReason?: string;
  blockedBy?: string;
  blockedAt?: string;
  unblockedBy?: string;
  unblockedAt?: string;
  qrToken: string;
}

export type LotLinkType =
  | 'origem'
  | 'consumo'
  | 'divisao'
  | 'mistura'
  | 'agregacao'
  | 'transformacao'
  | 'embalagem'
  | 'perda';

export interface LotLink {
  id: string;
  tenantId: string;
  sourceBatchId: string;
  targetBatchId: string;
  type: LotLinkType;
  quantity: number;
  unit: 'kg' | 'caixas' | 'plantas' | 'unidades';
  timestamp: string;
  operatorId: string;
  notes?: string;
}

export interface HarvestRecord {
  id: string;
  tenantId: string;
  batchId: string;
  harvestCode: string;
  harvestedAt: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  unitsCount: number;
  cullsKg: number; // perdas/descarte
  cullReason?: string;
  operatorId: string;
  qualityGrade: QualityGrade;
  brixDegree?: number;
  isLocked: boolean;
}

export interface PackLot {
  id: string;
  tenantId: string;
  packCode: string; // Ex: EMB-TOM-092
  harvestBatchId: string;
  packageType: 'Caixa 10kg' | 'Bandeja 500g' | 'Caixa 20kg' | 'Pallet 400kg';
  unitsPacked: number;
  totalWeightKg: number;
  packedAt: string;
  expiryDate: string;
  qualityAuditorApproved: boolean;
  auditorId?: string;
  qrToken: string;
  status: 'in_stock' | 'allocated' | 'shipped' | 'recalled';
  storageLocation: string;
}

export interface ShipmentLine {
  id: string;
  tenantId: string;
  shipmentId: string;
  packLotId: string;
  quantityBoxes: number;
  totalKg: number;
}

export interface Shipment {
  id: string;
  tenantId: string;
  shipmentCode: string;
  buyerName: string;
  buyerDestination: string; // Ex: Asunción Mercado Central
  shippedAt: string;
  transportVehiclePlate: string;
  driverName: string;
  lines: ShipmentLine[];
  status: 'created' | 'in_transit' | 'delivered' | 'returned';
  qrVerificationToken: string;
}

export interface DatastreamReading {
  id: string;
  tenantId: string;
  deviceId: string;
  zoneId: string;
  timestamp: string;
  airTemp: number; // °C
  airHumidity: number; // %
  calculatedVPD: number; // kPa
  solutionPH: number; // pH
  solutionEC: number; // mS/cm
  solutionTemp: number; // °C
  flowRateLh: number; // L/h
  reservoirLevelPct: number; // %
  quality: 'good' | 'warning' | 'frozen' | 'abrupt_jump' | 'out_of_range';
}

export interface Alert {
  id: string;
  tenantId: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'ph' | 'ec' | 'vpd' | 'sensor_offline' | 'task_overdue' | 'quality_hold' | 'quarantine';
  zoneId?: string;
  batchId?: string;
  message: string;
  createdAt: string;
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'verified';
  acknowledgedBy?: string;
  resolvedBy?: string;
  correctiveAction?: string;
}

export interface AIDiagnosisResult {
  pestOrFungus: string;
  scientificName?: string;
  category: 'fungo' | 'praga' | 'bacteria' | 'fisiologico';
  confidencePct: number;
  severity: 'leve' | 'moderada' | 'critica';
  descriptionPt: string;
  descriptionEs: string;
  solutionAudioScriptPt: string;
  solutionAudioScriptEs: string;
  culturalMeasures: string[];
  biologicalControl: string;
  approvedProductsSenave: string[];
  urgentActionRequired: boolean;
}

export interface FieldInspection {
  id: string;
  tenantId: string;
  templateType: 'turno_diario' | 'ph_ec_manual' | 'fitossanidade' | 'higiene_estufa' | 'recebimento_insumo' | 'poda_manejo';
  zoneId: string;
  batchId?: string;
  inspectorName: string;
  inspectedAt: string;
  phManual?: number;
  ecManual?: number;
  findings: string;
  severity: 'normal' | 'leve' | 'moderada' | 'critica';
  correctiveActionTaken?: string;
  syncStatus: 'synced' | 'pending_sync' | 'conflict';
  photoUrl?: string;
  mediaType?: 'photo' | 'video';
  audioRecordingUrl?: string;
  audioDurationSec?: number;
  audioTranscript?: string;
  aiDiagnosis?: AIDiagnosisResult;
  hash: string;
}

export interface ComplianceItem {
  id: string;
  standard: 'SENAVE' | 'BPA-PY' | 'GLOBALG.A.P.' | 'GS1';
  code: string;
  requirement: string;
  validationStatus: 'validated' | 'pending_validation' | 'audit_required';
  responsibleRole: UserRole;
  mandatoryEvidence: string;
  lastCheckedDate: string;
}

export interface AuditEntry {
  id: string;
  tenantId: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  previousHash: string;
  currentHash: string;
}

export interface PublicTraceData {
  productName: string;
  cultivar: string;
  lotCode: string;
  producerName: string;
  region: string;
  harvestDate: string;
  packDate: string;
  qualityCertification: string;
  systemType: string;
  status: 'released' | 'hold' | 'recalled';
  institutionalContact: string;
}

// === GESTÃO DE INSUMOS & FERTIRRIGAÇÃO ===

export type InputCategory = 'fertilizante' | 'defensivo' | 'substrato' | 'semente' | 'embalagem' | 'agua' | 'outro';
export type InputUnit = 'kg' | 'L' | 'mL' | 'g' | 'unidade' | 'saco_25kg' | 'saco_50kg';

export interface InputItem {
  id: string;
  tenantId: string;
  name: string;
  tradeName: string;
  category: InputCategory;
  unit: InputUnit;
  currentStockQty: number;
  minStockQty: number;
  costPerUnit: number;
  supplierId: string;
  supplierName: string;
  lastPurchaseDate: string;
  expiryDate?: string;
  senaveRegistration?: string;
  isActive: boolean;
}

export interface InputMovement {
  id: string;
  tenantId: string;
  inputItemId: string;
  type: 'entrada' | 'saida' | 'ajuste' | 'perda';
  quantity: number;
  date: string;
  zoneId?: string;
  recipeId?: string;
  operatorId: string;
  notes?: string;
  invoiceRef?: string;
}

export type GrowthPhase = 'mudas' | 'vegetativo' | 'floracao' | 'frutificacao' | 'maturacao';

export interface NutrientRecipe {
  id: string;
  tenantId: string;
  name: string;
  cropType: 'tomate' | 'locote';
  growthPhase: GrowthPhase;
  targetPH: { min: number; max: number };
  targetEC: { min: number; max: number };
  components: RecipeComponent[];
  waterVolumeLiters: number;
  createdBy: string;
  approvedBy?: string;
  isActive: boolean;
  version: number;
  lastUsedDate?: string;
  notes?: string;
}

export interface RecipeComponent {
  inputItemId: string;
  inputName: string;
  quantityPerBatch: number;
  unit: InputUnit;
  orderOfAddition: number;
}

export interface FertigationLog {
  id: string;
  tenantId: string;
  recipeId: string;
  zoneId: string;
  appliedAt: string;
  phBefore: number;
  ecBefore: number;
  phAfter: number;
  ecAfter: number;
  volumeAppliedLiters: number;
  operatorId: string;
  observations?: string;
}

// === LINHA DO TEMPO UNIFICADA & CERTIFICAÇÃO DE RASTREABILIDADE ===

export interface UnifiedIntervention {
  id: string;
  batchId: string;
  zoneId: string;
  timestamp: string;
  type: 'nutricao' | 'manejo' | 'fitossanidade' | 'sensor_leitura' | 'colheita';
  title: string;
  productOrAction: string;
  dosage?: string;
  gracePeriodDays?: number;
  ph?: number;
  ec?: number;
  temperature?: number;
  humidity?: number;
  operatorName: string;
  operatorRole?: string;
  severity?: 'normal' | 'leve' | 'moderada' | 'atencao' | 'critica';
  notes?: string;
  verifiedHash: string;
  volumeLiters?: number;
  targetPestOrDisease?: string;
  senaveRegistry?: string;
  coverageArea?: string;
  plantsTreated?: number;
  cropStatus?: string;
}

