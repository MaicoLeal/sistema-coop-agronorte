import {
  PlantBatch,
  ProductionZone,
  LotLink,
  HarvestRecord,
  PackLot,
  Shipment,
  DatastreamReading,
  Alert,
  FieldInspection,
  ComplianceItem,
  AuditEntry,
  InputItem,
  InputMovement,
  NutrientRecipe,
  FertigationLog,
  UnifiedIntervention
} from '../types';

export const SEED_TENANT = {
  id: 'tenant-agronorte',
  name: 'Cooperativa Agronorte Ltda.',
  producer: '350+ Familias Conectadas • Guayaibí, San Pedro',
  unit: 'Complexo Hidropônico Central (12 Invernaderos Activos)',
  country: 'Paraguay',
  phone: '+595 21 123 456',
  facebook: '/cooperativaagronorte',
  instagram: '@agronorte_py',
  timezone: 'America/Asuncion'
};

export const INITIAL_ZONES: ProductionZone[] = [
  {
    id: 'zone-estufa-01',
    tenantId: SEED_TENANT.id,
    name: 'Invernadero 01 - Tomate Saladete San Marzano',
    type: 'greenhouse',
    cropType: 'tomate',
    cultivar: 'Saladete San Marzano',
    systemType: 'NFT',
    capacityPlants: 4500,
    activePlants: 4200
  },
  {
    id: 'zone-estufa-02',
    tenantId: SEED_TENANT.id,
    name: 'Invernadero 02 - Locote Verde Nathalie F1',
    type: 'greenhouse',
    cropType: 'locote',
    cultivar: 'Nathalie F1',
    systemType: 'substrato',
    capacityPlants: 3800,
    activePlants: 3600
  },
  {
    id: 'zone-estufa-03',
    tenantId: SEED_TENANT.id,
    name: 'Invernadero 03 - Tomate Italiano Seleção',
    type: 'greenhouse',
    cropType: 'tomate',
    cultivar: 'Italiano Gourmet',
    systemType: 'semi-hidroponico',
    capacityPlants: 4500,
    activePlants: 4350
  },
  {
    id: 'zone-estufa-04',
    tenantId: SEED_TENANT.id,
    name: 'Invernadero 04 - Locote Vermelho Magno',
    type: 'greenhouse',
    cropType: 'locote',
    cultivar: 'Magno F1',
    systemType: 'substrato',
    capacityPlants: 3800,
    activePlants: 3720
  },
  {
    id: 'zone-estufa-05',
    tenantId: SEED_TENANT.id,
    name: 'Invernadero 05 - Tomate Sweet Grape Alta Densidade',
    type: 'greenhouse',
    cropType: 'tomate',
    cultivar: 'Sweet Grape F1',
    systemType: 'NFT',
    capacityPlants: 5200,
    activePlants: 5050
  },
  {
    id: 'zone-estufa-06',
    tenantId: SEED_TENANT.id,
    name: 'Invernadero 06 - Locote Amarelo Blocky',
    type: 'greenhouse',
    cropType: 'locote',
    cultivar: 'Golden Star',
    systemType: 'substrato',
    capacityPlants: 3600,
    activePlants: 3480
  },
  {
    id: 'zone-estufa-07',
    tenantId: SEED_TENANT.id,
    name: 'Invernadero 07 - Tomate Perita Tradicional',
    type: 'greenhouse',
    cropType: 'tomate',
    cultivar: 'Perita Premium',
    systemType: 'semi-hidroponico',
    capacityPlants: 4200,
    activePlants: 4050
  },
  {
    id: 'zone-estufa-08',
    tenantId: SEED_TENANT.id,
    name: 'Invernadero 08 - Locote Laranja Gourmet',
    type: 'greenhouse',
    cropType: 'locote',
    cultivar: 'Orange King',
    systemType: 'substrato',
    capacityPlants: 3500,
    activePlants: 3380
  },
  {
    id: 'zone-estufa-09',
    tenantId: SEED_TENANT.id,
    name: 'Invernadero 09 - Tomate Cereja Ruby',
    type: 'greenhouse',
    cropType: 'tomate',
    cultivar: 'Ruby Gem NFT',
    systemType: 'NFT',
    capacityPlants: 4800,
    activePlants: 4620
  },
  {
    id: 'zone-estufa-10',
    tenantId: SEED_TENANT.id,
    name: 'Invernadero 10 - Tomate Carmim Exportação',
    type: 'greenhouse',
    cropType: 'tomate',
    cultivar: 'Carmim Export',
    systemType: 'NFT',
    capacityPlants: 4400,
    activePlants: 4250
  },
  {
    id: 'zone-estufa-11',
    tenantId: SEED_TENANT.id,
    name: 'Invernadero 11 - Locote Doce Mini-Blocky',
    type: 'greenhouse',
    cropType: 'locote',
    cultivar: 'Sweet Snack',
    systemType: 'substrato',
    capacityPlants: 3600,
    activePlants: 3500
  },
  {
    id: 'zone-estufa-12',
    tenantId: SEED_TENANT.id,
    name: 'Invernadero 12 - I+D & Biotecnologia Agrícola',
    type: 'greenhouse',
    cropType: 'tomate',
    cultivar: 'Híbridos Experimentais I+D',
    systemType: 'NFT',
    capacityPlants: 2800,
    activePlants: 2650
  }
];


export const INITIAL_BATCHES: PlantBatch[] = [
  {
    id: 'batch-tom-088',
    tenantId: SEED_TENANT.id,
    batchCode: 'LOTE-TOM-2026-088',
    zoneId: 'zone-estufa-01',
    crop: 'Tomate Saladete',
    cultivar: 'San Marzano Hidro',
    seedlingOrigin: 'Vivero Yguazú Lote #SEM-892',
    plantingDate: '2026-07-15T08:00:00Z',
    expectedHarvestDate: '2026-09-20T08:00:00Z',
    initialQuantity: 4000,
    currentActiveQuantity: 3850,
    status: 'active',
    isBlocked: false,
    qrToken: 'trace_token_tom_088_safe'
  },
  {
    id: 'batch-loc-042',
    tenantId: SEED_TENANT.id,
    batchCode: 'LOTE-LOC-2026-042',
    zoneId: 'zone-estufa-02',
    crop: 'Locote Verde/Vermelho',
    cultivar: 'Nathalie F1',
    seedlingOrigin: 'Mudas Certificadas RZ #4410',
    plantingDate: '2026-06-28T09:00:00Z',
    expectedHarvestDate: '2026-09-15T08:00:00Z',
    initialQuantity: 3200,
    currentActiveQuantity: 3120,
    status: 'active',
    isBlocked: false,
    qrToken: 'trace_token_loc_042_safe'
  },
  {
    id: 'batch-tom-079-quarantine',
    tenantId: SEED_TENANT.id,
    batchCode: 'LOTE-TOM-2026-079-Q',
    zoneId: 'zone-estufa-01',
    crop: 'Tomate Saladete',
    cultivar: 'San Marzano Hidro',
    seedlingOrigin: 'Vivero Yguazú Lote #SEM-810',
    plantingDate: '2026-06-10T08:00:00Z',
    expectedHarvestDate: '2026-08-25T08:00:00Z',
    initialQuantity: 3500,
    currentActiveQuantity: 3400,
    status: 'quarantine',
    isBlocked: true,
    blockReason: 'Suspeita fitossanitária: Análise preventiva de resíduo sob carência SENAVE',
    blockedBy: 'Ing. Carlos Ortiz (Auditor de Calidade)',
    blockedAt: '2026-09-08T14:30:00Z',
    qrToken: 'trace_token_tom_079_hold'
  }
];

export const INITIAL_HARVESTS: HarvestRecord[] = [
  {
    id: 'harv-088-01',
    tenantId: SEED_TENANT.id,
    batchId: 'batch-tom-088',
    harvestCode: 'COL-TOM-088-1',
    harvestedAt: '2026-09-10T07:30:00Z',
    grossWeightKg: 468.5,
    tareWeightKg: 18.5,
    netWeightKg: 450.0,
    unitsCount: 3600,
    cullsKg: 14.2,
    cullReason: 'Frutos com microfendas apicais por excesso de turgescência',
    operatorId: 'Juan Bareiro (Operador Estufa 1)',
    qualityGrade: 'extra',
    brixDegree: 5.2,
    isLocked: true
  },
  {
    id: 'harv-042-01',
    tenantId: SEED_TENANT.id,
    batchId: 'batch-loc-042',
    harvestCode: 'COL-LOC-042-1',
    harvestedAt: '2026-09-09T08:00:00Z',
    grossWeightKg: 395.0,
    tareWeightKg: 15.0,
    netWeightKg: 380.0,
    unitsCount: 1900,
    cullsKg: 9.8,
    cullReason: 'Pequenas manchas solares',
    operatorId: 'Marcos Benítez',
    qualityGrade: 'primeira',
    brixDegree: 6.8,
    isLocked: true
  }
];

export const INITIAL_PACK_LOTS: PackLot[] = [
  {
    id: 'pack-tom-088-cx10',
    tenantId: SEED_TENANT.id,
    packCode: 'EMB-TOM-088-CX10',
    harvestBatchId: 'harv-088-01',
    packageType: 'Caixa 10kg',
    unitsPacked: 40,
    totalWeightKg: 400.0,
    packedAt: '2026-09-10T11:00:00Z',
    expiryDate: '2026-09-24T23:59:59Z',
    qualityAuditorApproved: true,
    auditorId: 'Ing. Carlos Ortiz',
    qrToken: 'qr_token_emb_tom_088',
    status: 'allocated',
    storageLocation: 'Câmara Fria 02 - Posição A-04'
  },
  {
    id: 'pack-loc-042-cx10',
    tenantId: SEED_TENANT.id,
    packCode: 'EMB-LOC-042-CX10',
    harvestBatchId: 'harv-042-01',
    packageType: 'Caixa 10kg',
    unitsPacked: 35,
    totalWeightKg: 350.0,
    packedAt: '2026-09-09T14:30:00Z',
    expiryDate: '2026-09-27T23:59:59Z',
    qualityAuditorApproved: true,
    auditorId: 'Ing. Carlos Ortiz',
    qrToken: 'qr_token_emb_loc_042',
    status: 'in_stock',
    storageLocation: 'Câmara Fria 01 - Posição B-02'
  },
  {
    id: 'pack-tom-079-blocked',
    tenantId: SEED_TENANT.id,
    packCode: 'EMB-TOM-079-BLOQ',
    harvestBatchId: 'batch-tom-079-quarantine',
    packageType: 'Caixa 10kg',
    unitsPacked: 25,
    totalWeightKg: 250.0,
    packedAt: '2026-09-08T16:00:00Z',
    expiryDate: '2026-09-22T23:59:59Z',
    qualityAuditorApproved: false,
    auditorId: 'Ing. Carlos Ortiz',
    qrToken: 'qr_token_emb_tom_079_hold',
    status: 'recalled',
    storageLocation: 'Área de Quarentena Isolada Q-1'
  }
];

export const INITIAL_LOT_LINKS: LotLink[] = [
  {
    id: 'link-1',
    tenantId: SEED_TENANT.id,
    sourceBatchId: 'Vivero Yguazú #SEM-892',
    targetBatchId: 'batch-tom-088',
    type: 'origem',
    quantity: 4000,
    unit: 'plantas',
    timestamp: '2026-07-15T08:00:00Z',
    operatorId: 'Ing. Arnaldo Silva'
  },
  {
    id: 'link-2',
    tenantId: SEED_TENANT.id,
    sourceBatchId: 'batch-tom-088',
    targetBatchId: 'harv-088-01',
    type: 'consumo',
    quantity: 450,
    unit: 'kg',
    timestamp: '2026-09-10T07:30:00Z',
    operatorId: 'Juan Bareiro'
  },
  {
    id: 'link-3',
    tenantId: SEED_TENANT.id,
    sourceBatchId: 'harv-088-01',
    targetBatchId: 'pack-tom-088-cx10',
    type: 'embalagem',
    quantity: 40,
    unit: 'caixas',
    timestamp: '2026-09-10T11:00:00Z',
    operatorId: 'Mirtha G.'
  },
  {
    id: 'link-4',
    tenantId: SEED_TENANT.id,
    sourceBatchId: 'Mudas Certificadas RZ #4410',
    targetBatchId: 'batch-loc-042',
    type: 'origem',
    quantity: 3200,
    unit: 'plantas',
    timestamp: '2026-06-28T09:00:00Z',
    operatorId: 'Ing. Arnaldo Silva'
  },
  {
    id: 'link-5',
    tenantId: SEED_TENANT.id,
    sourceBatchId: 'batch-loc-042',
    targetBatchId: 'harv-042-01',
    type: 'consumo',
    quantity: 380,
    unit: 'kg',
    timestamp: '2026-09-09T08:00:00Z',
    operatorId: 'Marcos Benítez'
  },
  {
    id: 'link-6',
    tenantId: SEED_TENANT.id,
    sourceBatchId: 'harv-042-01',
    targetBatchId: 'pack-loc-042-cx10',
    type: 'embalagem',
    quantity: 35,
    unit: 'caixas',
    timestamp: '2026-09-09T14:30:00Z',
    operatorId: 'Mirtha G.'
  }
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'ship-2026-015',
    tenantId: SEED_TENANT.id,
    shipmentCode: 'DESP-AGRO-2026-015',
    buyerName: 'Superseis / Retail S.A. (Asunción)',
    buyerDestination: 'Centro de Distribución Mariano Roque Alonso',
    shippedAt: '2026-09-10T13:45:00Z',
    transportVehiclePlate: 'AAPY-904 (Caminhão Refrigerado)',
    driverName: 'Rubén Domínguez',
    lines: [
      {
        id: 'line-01',
        tenantId: SEED_TENANT.id,
        shipmentId: 'ship-2026-015',
        packLotId: 'pack-tom-088-cx10',
        quantityBoxes: 30,
        totalKg: 300.0
      }
    ],
    status: 'in_transit',
    qrVerificationToken: 'desp_token_015_safe'
  }
];

export const INITIAL_READINGS: DatastreamReading[] = [
  {
    id: 'read-01',
    tenantId: SEED_TENANT.id,
    deviceId: 'gw-estufa01-esp32',
    zoneId: 'zone-estufa-01',
    timestamp: new Date().toISOString(),
    airTemp: 24.8,
    airHumidity: 68.2,
    calculatedVPD: 0.98,
    solutionPH: 5.92,
    solutionEC: 2.15,
    solutionTemp: 21.4,
    flowRateLh: 420.0,
    reservoirLevelPct: 84.5,
    quality: 'good'
  },
  {
    id: 'read-02',
    tenantId: SEED_TENANT.id,
    deviceId: 'gw-estufa02-esp32',
    zoneId: 'zone-estufa-02',
    timestamp: new Date().toISOString(),
    airTemp: 25.4,
    airHumidity: 64.0,
    calculatedVPD: 1.15,
    solutionPH: 6.08,
    solutionEC: 2.30,
    solutionTemp: 22.0,
    flowRateLh: 380.0,
    reservoirLevelPct: 78.0,
    quality: 'good'
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alert-01',
    tenantId: SEED_TENANT.id,
    title: 'pH Ligeiramente Elevado - Tanque B',
    severity: 'medium',
    category: 'ph',
    zoneId: 'zone-estufa-01',
    batchId: 'batch-tom-088',
    message: 'Leitura de pH atingiu 6.38 (Faixa alvo recomendada: 5.8 a 6.2). Recomenda-se calibração de ácido nítrico.',
    createdAt: '2026-09-10T12:15:00Z',
    status: 'acknowledged',
    acknowledgedBy: 'Ing. Arnaldo Silva'
  },
  {
    id: 'alert-02',
    tenantId: SEED_TENANT.id,
    title: 'Quarentena Fitossanitária Ativa',
    severity: 'critical',
    category: 'quarantine',
    zoneId: 'zone-estufa-01',
    batchId: 'batch-tom-079-quarantine',
    message: 'Lote LOTE-TOM-2026-079-Q com bloqueio total de colheita e expedição aguardando contraprova SENAVE.',
    createdAt: '2026-09-08T14:30:00Z',
    status: 'in_progress',
    acknowledgedBy: 'Ing. Carlos Ortiz'
  }
];

export const INITIAL_INSPECTIONS: FieldInspection[] = [
  {
    id: 'insp-01',
    tenantId: SEED_TENANT.id,
    templateType: 'turno_diario',
    zoneId: 'zone-estufa-01',
    batchId: 'batch-tom-088',
    inspectorName: 'Juan Bareiro',
    inspectedAt: '2026-09-10T06:30:00Z',
    phManual: 5.9,
    ecManual: 2.1,
    findings: 'Bancadas limpas, drenagem fluindo normalmente sem entupimento de bicos.',
    severity: 'normal',
    syncStatus: 'synced',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'insp-02',
    tenantId: SEED_TENANT.id,
    templateType: 'fitossanidade',
    zoneId: 'zone-estufa-02',
    batchId: 'batch-loc-042',
    inspectorName: 'Marcos Benítez',
    inspectedAt: '2026-09-09T16:00:00Z',
    findings: 'Armadilhas cromáticas amarelas inspecionadas: 2 indivíduos de mosca branca por armadilha. Abaixo do nível de ação.',
    severity: 'normal',
    syncStatus: 'synced',
    hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
  }
];

export const INITIAL_COMPLIANCE: ComplianceItem[] = [
  {
    id: 'comp-01',
    standard: 'SENAVE',
    code: 'SENAVE-RES-142/2020',
    requirement: 'Registro de origem de sementes e mudas com Certificado Fitossanitário de Origem (CFO).',
    validationStatus: 'validated',
    responsibleRole: 'agronomist',
    mandatoryEvidence: 'Nota Fiscal e CFO do Viveiro Certificado Yguazú #SEM-892',
    lastCheckedDate: '2026-07-16'
  },
  {
    id: 'comp-02',
    standard: 'BPA-PY',
    code: 'BPA-HIDRO-AGUA-04',
    requirement: 'Análise físico-química e microbiológica da água de poço artesiano semestral (ausência de coliformes).',
    validationStatus: 'validated',
    responsibleRole: 'quality_auditor',
    mandatoryEvidence: 'Laudo Laboratorial LabAgro nº 8812/2026',
    lastCheckedDate: '2026-08-01'
  },
  {
    id: 'comp-03',
    standard: 'GLOBALG.A.P.',
    code: 'CB.5.2.1-HOLD-RECALL',
    requirement: 'Procedimento testado e documentado de simulação anual de recall e bloqueio imediato de lotes.',
    validationStatus: 'validated',
    responsibleRole: 'quality_auditor',
    mandatoryEvidence: 'Simulador integrado e relatório de auditoria gerado pelo sistema',
    lastCheckedDate: '2026-09-05'
  },
  {
    id: 'comp-04',
    standard: 'GS1',
    code: 'GS1-128-EPCIS-PREP',
    requirement: 'Estruturação de lotes compatível com identificadores globais (GTIN / SSCC).',
    validationStatus: 'pending_validation',
    responsibleRole: 'tenant_admin',
    mandatoryEvidence: 'Aguardando validação formal de prefixo de empresa GS1 Paraguai',
    lastCheckedDate: '2026-09-01'
  }
];

export const INITIAL_AUDIT_LOG: AuditEntry[] = [
  {
    id: 'aud-01',
    tenantId: SEED_TENANT.id,
    timestamp: '2026-09-08T14:30:00Z',
    userId: 'carlos.ortiz@agronorte.com.py',
    userRole: 'quality_auditor',
    action: 'BATCH_HOLD_APPLIED',
    entity: 'PlantBatch',
    entityId: 'batch-tom-079-quarantine',
    details: 'Bloqueio fitossanitário preventivo do Lote LOTE-TOM-2026-079-Q.',
    previousHash: 'GENESIS_HASH_COOP_AGRONORTE_2026',
    currentHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
  },
  {
    id: 'aud-02',
    tenantId: SEED_TENANT.id,
    timestamp: '2026-09-10T13:45:00Z',
    userId: 'ruben.d@agronorte.com.py',
    userRole: 'farm_manager',
    action: 'SHIPMENT_DISPATCHED',
    entity: 'Shipment',
    entityId: 'ship-2026-015',
    details: 'Expedição DESP-AGRO-2026-015 com 30 caixas do lote EMB-TOM-088-CX10 liberada para Retail S.A.',
    previousHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    currentHash: '39d2c679a941f6e2101e4a2c5a0dbd5d9c22c061803ea4274c5d4efd226a0901'
  }
];

// === GESTÃO DE INSUMOS & FERTIRRIGAÇÃO ===

export const INITIAL_INPUT_ITEMS: InputItem[] = [
  {
    id: 'inp-nitrato-calcio',
    tenantId: SEED_TENANT.id,
    name: 'Nitrato de Cálcio',
    tradeName: 'Yara Calcinit',
    category: 'fertilizante',
    unit: 'saco_25kg',
    currentStockQty: 18,
    minStockQty: 5,
    costPerUnit: 185000,
    supplierId: 'sup-yara-py',
    supplierName: 'Yara Paraguay S.A.',
    lastPurchaseDate: '2026-08-20T10:00:00Z',
    isActive: true
  },
  {
    id: 'inp-map',
    tenantId: SEED_TENANT.id,
    name: 'Fosfato Monoamônico (MAP)',
    tradeName: 'MAP Solúvel Tekno',
    category: 'fertilizante',
    unit: 'saco_25kg',
    currentStockQty: 12,
    minStockQty: 4,
    costPerUnit: 210000,
    supplierId: 'sup-tekno-agro',
    supplierName: 'Tekno Agro Import',
    lastPurchaseDate: '2026-08-15T14:00:00Z',
    isActive: true
  },
  {
    id: 'inp-sulfato-potassio',
    tenantId: SEED_TENANT.id,
    name: 'Sulfato de Potássio (SOP)',
    tradeName: 'Yara Krista SOP',
    category: 'fertilizante',
    unit: 'saco_25kg',
    currentStockQty: 8,
    minStockQty: 4,
    costPerUnit: 245000,
    supplierId: 'sup-yara-py',
    supplierName: 'Yara Paraguay S.A.',
    lastPurchaseDate: '2026-08-20T10:00:00Z',
    isActive: true
  },
  {
    id: 'inp-acido-fosforico',
    tenantId: SEED_TENANT.id,
    name: 'Ácido Fosfórico 85%',
    tradeName: 'Ácido Fosfórico P.A.',
    category: 'fertilizante',
    unit: 'L',
    currentStockQty: 45,
    minStockQty: 10,
    costPerUnit: 32000,
    supplierId: 'sup-quimica-py',
    supplierName: 'Química Industrial PY',
    lastPurchaseDate: '2026-07-28T09:00:00Z',
    isActive: true
  },
  {
    id: 'inp-micromix',
    tenantId: SEED_TENANT.id,
    name: 'Micronutrientes Quelados (MicroMix)',
    tradeName: 'Rexene MicroMix Premium',
    category: 'fertilizante',
    unit: 'kg',
    currentStockQty: 15,
    minStockQty: 3,
    costPerUnit: 98000,
    supplierId: 'sup-rexene',
    supplierName: 'Rexene do Paraguai',
    lastPurchaseDate: '2026-08-10T11:00:00Z',
    isActive: true
  },
  {
    id: 'inp-fibra-coco',
    tenantId: SEED_TENANT.id,
    name: 'Substrato Fibra de Coco',
    tradeName: 'CocoGreen Block 5kg',
    category: 'substrato',
    unit: 'unidade',
    currentStockQty: 120,
    minStockQty: 30,
    costPerUnit: 28000,
    supplierId: 'sup-cocogreen',
    supplierName: 'CocoGreen Paraguay',
    lastPurchaseDate: '2026-07-15T08:00:00Z',
    isActive: true
  },
  {
    id: 'inp-mudas-tomate',
    tenantId: SEED_TENANT.id,
    name: 'Mudas Tomate San Marzano',
    tradeName: 'Mudas Certificadas Yguazú',
    category: 'semente',
    unit: 'unidade',
    currentStockQty: 500,
    minStockQty: 200,
    costPerUnit: 1200,
    supplierId: 'sup-vivero-yguazu',
    supplierName: 'Vivero Yguazú Certificado',
    lastPurchaseDate: '2026-07-10T07:00:00Z',
    isActive: true
  },
  {
    id: 'inp-caixa-10kg',
    tenantId: SEED_TENANT.id,
    name: 'Caixa Papelão 10kg Impressa',
    tradeName: 'Caixa Agronorte 10kg',
    category: 'embalagem',
    unit: 'unidade',
    currentStockQty: 800,
    minStockQty: 200,
    costPerUnit: 4500,
    supplierId: 'sup-embalagens-py',
    supplierName: 'Embalagens del Este',
    lastPurchaseDate: '2026-08-25T13:00:00Z',
    isActive: true
  }
];

export const INITIAL_RECIPES: NutrientRecipe[] = [
  {
    id: 'recipe-tom-veg',
    tenantId: SEED_TENANT.id,
    name: 'Receita Tomate — Fase Vegetativa',
    cropType: 'tomate',
    growthPhase: 'vegetativo',
    targetPH: { min: 5.8, max: 6.2 },
    targetEC: { min: 1.8, max: 2.4 },
    components: [
      { inputItemId: 'inp-nitrato-calcio', inputName: 'Nitrato de Cálcio', quantityPerBatch: 800, unit: 'g', orderOfAddition: 1 },
      { inputItemId: 'inp-map', inputName: 'MAP', quantityPerBatch: 200, unit: 'g', orderOfAddition: 2 },
      { inputItemId: 'inp-sulfato-potassio', inputName: 'Sulfato de Potássio', quantityPerBatch: 350, unit: 'g', orderOfAddition: 3 },
      { inputItemId: 'inp-micromix', inputName: 'MicroMix', quantityPerBatch: 25, unit: 'g', orderOfAddition: 4 },
      { inputItemId: 'inp-acido-fosforico', inputName: 'Ácido Fosfórico', quantityPerBatch: 15, unit: 'mL', orderOfAddition: 5 }
    ],
    waterVolumeLiters: 1000,
    createdBy: 'Ing. Arnaldo Silva',
    approvedBy: 'Ing. Carlos Ortiz',
    isActive: true,
    version: 2,
    lastUsedDate: '2026-09-14T07:00:00Z',
    notes: 'Receita padrão para fase vegetativa. Dissolva o Nitrato de Cálcio separadamente no Tanque A. Os demais no Tanque B.'
  },
  {
    id: 'recipe-tom-frut',
    tenantId: SEED_TENANT.id,
    name: 'Receita Tomate — Frutificação',
    cropType: 'tomate',
    growthPhase: 'frutificacao',
    targetPH: { min: 5.5, max: 6.0 },
    targetEC: { min: 2.2, max: 2.8 },
    components: [
      { inputItemId: 'inp-nitrato-calcio', inputName: 'Nitrato de Cálcio', quantityPerBatch: 650, unit: 'g', orderOfAddition: 1 },
      { inputItemId: 'inp-map', inputName: 'MAP', quantityPerBatch: 250, unit: 'g', orderOfAddition: 2 },
      { inputItemId: 'inp-sulfato-potassio', inputName: 'Sulfato de Potássio', quantityPerBatch: 500, unit: 'g', orderOfAddition: 3 },
      { inputItemId: 'inp-micromix', inputName: 'MicroMix', quantityPerBatch: 30, unit: 'g', orderOfAddition: 4 },
      { inputItemId: 'inp-acido-fosforico', inputName: 'Ácido Fosfórico', quantityPerBatch: 20, unit: 'mL', orderOfAddition: 5 }
    ],
    waterVolumeLiters: 1000,
    createdBy: 'Ing. Arnaldo Silva',
    approvedBy: 'Ing. Carlos Ortiz',
    isActive: true,
    version: 1,
    lastUsedDate: '2026-09-12T07:30:00Z',
    notes: 'Aumentar K para firmeza do fruto. Monitorar EC diariamente — ajustar se >2.8 mS/cm.'
  },
  {
    id: 'recipe-loc-geral',
    tenantId: SEED_TENANT.id,
    name: 'Receita Locote — Geral (Substrato)',
    cropType: 'locote',
    growthPhase: 'floracao',
    targetPH: { min: 5.8, max: 6.5 },
    targetEC: { min: 2.0, max: 2.6 },
    components: [
      { inputItemId: 'inp-nitrato-calcio', inputName: 'Nitrato de Cálcio', quantityPerBatch: 700, unit: 'g', orderOfAddition: 1 },
      { inputItemId: 'inp-map', inputName: 'MAP', quantityPerBatch: 180, unit: 'g', orderOfAddition: 2 },
      { inputItemId: 'inp-sulfato-potassio', inputName: 'Sulfato de Potássio', quantityPerBatch: 420, unit: 'g', orderOfAddition: 3 },
      { inputItemId: 'inp-micromix', inputName: 'MicroMix', quantityPerBatch: 20, unit: 'g', orderOfAddition: 4 },
      { inputItemId: 'inp-acido-fosforico', inputName: 'Ácido Fosfórico', quantityPerBatch: 12, unit: 'mL', orderOfAddition: 5 }
    ],
    waterVolumeLiters: 1000,
    createdBy: 'Ing. Arnaldo Silva',
    approvedBy: 'Ing. Carlos Ortiz',
    isActive: true,
    version: 1,
    lastUsedDate: '2026-09-13T08:00:00Z',
    notes: 'Receita adaptada para substrato de fibra de coco. Fertirregar 4-6x/dia conforme demanda evaporativa.'
  }
];

export const INITIAL_INPUT_MOVEMENTS: InputMovement[] = [
  {
    id: 'mov-001',
    tenantId: SEED_TENANT.id,
    inputItemId: 'inp-nitrato-calcio',
    type: 'entrada',
    quantity: 20,
    date: '2026-08-20T10:00:00Z',
    operatorId: 'Marcos Benítez',
    notes: 'Compra mensal regular',
    invoiceRef: 'NF-YARA-2026-4412'
  },
  {
    id: 'mov-002',
    tenantId: SEED_TENANT.id,
    inputItemId: 'inp-nitrato-calcio',
    type: 'saida',
    quantity: 2,
    date: '2026-09-10T06:30:00Z',
    zoneId: 'zone-estufa-01',
    recipeId: 'recipe-tom-veg',
    operatorId: 'Juan Bareiro',
    notes: 'Preparo de solução nutritiva matinal'
  },
  {
    id: 'mov-003',
    tenantId: SEED_TENANT.id,
    inputItemId: 'inp-fibra-coco',
    type: 'entrada',
    quantity: 150,
    date: '2026-07-15T08:00:00Z',
    operatorId: 'Marcos Benítez',
    notes: 'Reposição para Estufas 02, 04, 06, 08, 11',
    invoiceRef: 'NF-COCO-2026-891'
  },
  {
    id: 'mov-004',
    tenantId: SEED_TENANT.id,
    inputItemId: 'inp-fibra-coco',
    type: 'saida',
    quantity: 30,
    date: '2026-07-16T09:00:00Z',
    zoneId: 'zone-estufa-02',
    operatorId: 'Marcos Benítez',
    notes: 'Substituição de substrato das bancadas B3-B6'
  },
  {
    id: 'mov-005',
    tenantId: SEED_TENANT.id,
    inputItemId: 'inp-sulfato-potassio',
    type: 'entrada',
    quantity: 10,
    date: '2026-08-20T10:00:00Z',
    operatorId: 'Marcos Benítez',
    notes: 'Compra conjunta com Nitrato de Cálcio',
    invoiceRef: 'NF-YARA-2026-4412'
  }
];

export const INITIAL_FERTIGATION_LOGS: FertigationLog[] = [
  {
    id: 'fert-001',
    tenantId: SEED_TENANT.id,
    recipeId: 'recipe-tom-veg',
    zoneId: 'zone-estufa-01',
    appliedAt: '2026-09-14T07:00:00Z',
    phBefore: 6.35,
    ecBefore: 1.85,
    phAfter: 5.92,
    ecAfter: 2.15,
    volumeAppliedLiters: 1200,
    operatorId: 'Juan Bareiro',
    observations: 'pH corrigido com ácido fosfórico. EC dentro da faixa-alvo após ajuste.'
  },
  {
    id: 'fert-002',
    tenantId: SEED_TENANT.id,
    recipeId: 'recipe-loc-geral',
    zoneId: 'zone-estufa-02',
    appliedAt: '2026-09-13T08:00:00Z',
    phBefore: 6.50,
    ecBefore: 2.05,
    phAfter: 6.08,
    ecAfter: 2.30,
    volumeAppliedLiters: 800,
    operatorId: 'Marcos Benítez',
    observations: 'Aplicação matinal normal. Substrato com boa drenagem.'
  }
];

export const INITIAL_INTERVENTIONS: UnifiedIntervention[] = [
  // === LOTE TOMATE SALADETE (batch-tom-088 • Invernadero 01) ===
  {
    id: 'int-tom-01',
    batchId: 'batch-tom-088',
    zoneId: 'zone-estufa-01',
    timestamp: '2026-07-15T08:00:00Z',
    type: 'manejo',
    title: 'Plantación y Trasplante en Bancada NFT',
    productOrAction: '4.000 plantines sanos de Tomate Saladete San Marzano (Vivero Yguazú #SEM-892)',
    dosage: 'Espaciamiento de 25cm entre plantas',
    operatorName: 'Mateo González',
    operatorRole: 'Técnico de Campo',
    severity: 'normal',
    notes: 'Plantines con 4 hojas verdaderas y excelente enraizamiento. Bancadas previamente sanitizadas con ácido peracético.',
    verifiedHash: 'sha256_bpa_tom01_init'
  },
  {
    id: 'int-tom-02',
    batchId: 'batch-tom-088',
    zoneId: 'zone-estufa-01',
    timestamp: '2026-07-25T09:30:00Z',
    type: 'nutricao',
    title: 'Fertirriego Nutritivo Vegetativo',
    productOrAction: 'Fórmula N-P-K 15-05-30 + Quelato de Hierro EDDHA + Sulfato de Magnesio',
    dosage: '1.2 g/Litro de solución nutritiva',
    gracePeriodDays: 0,
    ph: 5.95,
    ec: 1.85,
    temperature: 23.8,
    humidity: 76,
    operatorName: 'Ing. Carlos Ortiz',
    operatorRole: 'Ingeniero Agrónomo',
    severity: 'normal',
    notes: 'Inicio de fase vegetativa rápida. Conductividad eléctrica ajustada para desarrollo radicular.',
    verifiedHash: 'sha256_bpa_tom02_nutri'
  },
  {
    id: 'int-tom-03',
    batchId: 'batch-tom-088',
    zoneId: 'zone-estufa-01',
    timestamp: '2026-08-05T07:15:00Z',
    type: 'manejo',
    title: 'Desbrote Manual y Tutorado con Hilo',
    productOrAction: 'Retiro de brotes axilares y conducción a un solo tallo',
    dosage: '100% de las 4.000 plantas tutoradas',
    operatorName: 'Juan Pérez',
    operatorRole: 'Operador de Invernadero',
    severity: 'normal',
    notes: 'Desbrote realizado antes del mediodía para rápida cicatrización al sol.',
    verifiedHash: 'sha256_bpa_tom03_poda'
  },
  {
    id: 'int-tom-04',
    batchId: 'batch-tom-088',
    zoneId: 'zone-estufa-01',
    timestamp: '2026-08-18T10:00:00Z',
    type: 'nutricao',
    title: 'Aplicación Nutricional de Floración y Cuajado',
    productOrAction: 'Nitrato de Calcio YaraLiva Calcinit + Ácido Bórico',
    dosage: '1.5 g/L Calcio + 0.3 mg/L Boro',
    gracePeriodDays: 0,
    ph: 6.05,
    ec: 2.20,
    temperature: 25.1,
    humidity: 72,
    operatorName: 'Ing. Carlos Ortiz',
    operatorRole: 'Ingeniero Agrónomo',
    severity: 'normal',
    notes: 'Prevención de podredumbre apical (fondo negro) y estímulo al florecimiento uniforme de la 2ª floración.',
    verifiedHash: 'sha256_bpa_tom04_calcio'
  },
  {
    id: 'int-tom-05',
    batchId: 'batch-tom-088',
    zoneId: 'zone-estufa-01',
    timestamp: '2026-08-28T14:20:00Z',
    type: 'fitossanidade',
    title: 'Control Biológico Preventivo de Raíz y Hojas',
    productOrAction: 'Bacillus subtilis + Trichoderma harzianum (Bioinsumo Certificado SENAVE)',
    dosage: '2 mL/Litro vía circulación continua',
    gracePeriodDays: 0,
    ph: 6.10,
    ec: 2.15,
    operatorName: 'Juan Pérez',
    operatorRole: 'Operador de Invernadero',
    severity: 'normal',
    notes: 'Protección fúngica biológica. Carencia cero (0 días). Totalmente seguro para cosecha.',
    verifiedHash: 'sha256_bpa_tom05_bio'
  },
  {
    id: 'int-tom-06',
    batchId: 'batch-tom-088',
    zoneId: 'zone-estufa-01',
    timestamp: '2026-09-06T08:45:00Z',
    type: 'fitossanidade',
    title: 'Inspección Fitosanitaria Atestada por IA Don Mateo',
    productOrAction: 'Muestreo en 60 puntos foliares e inspección de brotes',
    operatorName: 'Mateo González',
    operatorRole: 'Técnico de Campo',
    severity: 'normal',
    notes: 'Informe: Hojas limpias, vigor excelente, ausencia de polilla del tomate y mildiú.',
    verifiedHash: 'sha256_bpa_tom06_insp'
  },
  {
    id: 'int-tom-07',
    batchId: 'batch-tom-088',
    zoneId: 'zone-estufa-01',
    timestamp: '2026-09-12T11:30:00Z',
    type: 'sensor_leitura',
    title: 'Calibración Instrumental y Lectura de Sensores',
    productOrAction: 'Medición por conductímetro y pH-metro digital de bancada',
    ph: 6.08,
    ec: 2.18,
    temperature: 24.5,
    humidity: 74,
    operatorName: 'Mateo González',
    operatorRole: 'Técnico de Campo',
    severity: 'normal',
    notes: 'Solución nutritiva en equilibrio perfecto. Lecturas de sensores IoT calibradas con precisión.',
    verifiedHash: 'sha256_bpa_tom07_calib'
  },
  {
    id: 'int-tom-08',
    batchId: 'batch-tom-088',
    zoneId: 'zone-estufa-01',
    timestamp: '2026-09-15T07:30:00Z',
    type: 'colheita',
    title: 'Cosecha de 1ª Floración - Selección Primera Línea',
    productOrAction: 'Cosecha manual en punto ensalada (maduración 3/5)',
    dosage: '45 cajas estándar (900 kg netos cosechados)',
    operatorName: 'Juan Pérez',
    operatorRole: 'Operador de Invernadero',
    severity: 'normal',
    notes: 'Frutos con 5.2 °Brix, coloración uniforme, calibre 60-70mm. Trazabilidad y etiquetas QR emitidas.',
    verifiedHash: 'sha256_bpa_tom08_harvest'
  },

  // === LOTE LOCOTE VERDE (batch-loc-042 • Invernadero 02) ===
  {
    id: 'int-loc-01',
    batchId: 'batch-loc-042',
    zoneId: 'zone-estufa-02',
    timestamp: '2026-06-28T09:00:00Z',
    type: 'manejo',
    title: 'Trasplante de Plantines Nathalie F1 en Sustrato',
    productOrAction: '3.200 plantines en bolsas de cultivo de fibra de coco y cascarilla de arroz',
    dosage: '2 plantines por punto de goteo',
    operatorName: 'Mateo González',
    operatorRole: 'Técnico de Campo',
    severity: 'normal',
    notes: 'Sustrato previamente saturado y lavado con conductividad de salida en 0.8 mS/cm.',
    verifiedHash: 'sha256_bpa_loc01_transp'
  },
  {
    id: 'int-loc-02',
    batchId: 'batch-loc-042',
    zoneId: 'zone-estufa-02',
    timestamp: '2026-07-10T08:30:00Z',
    type: 'nutricao',
    title: 'Fertirriego de Enraizamiento y Fósforo Asimilable',
    productOrAction: 'Fosfato Monopotásico MKP + Nitrato de Potasio + Magnesio',
    dosage: '1.0 g/L de agua de riego por pulso',
    gracePeriodDays: 0,
    ph: 6.25,
    ec: 1.65,
    temperature: 24.2,
    humidity: 78,
    operatorName: 'Ing. Carlos Ortiz',
    operatorRole: 'Ingeniero Agrónomo',
    severity: 'normal',
    notes: 'Excelente respuesta radicular. Plantas establecidas en 12 días.',
    verifiedHash: 'sha256_bpa_loc02_enraiz'
  },
  {
    id: 'int-loc-03',
    batchId: 'batch-loc-042',
    zoneId: 'zone-estufa-02',
    timestamp: '2026-07-28T07:45:00Z',
    type: 'manejo',
    title: 'Poda de Formación y Raleo de 1ª Flor (Flor Rey)',
    productOrAction: 'Eliminación de la primera flor de la bifurcación central para vigor de copa',
    dosage: '100% del invernadero',
    operatorName: 'Juan Pérez',
    operatorRole: 'Operador de Invernadero',
    severity: 'normal',
    notes: 'Estimula a la planta a formar cuatro tallos vigorosos antes de la fructificación comercial.',
    verifiedHash: 'sha256_bpa_loc03_flor_rei'
  },
  {
    id: 'int-loc-04',
    batchId: 'batch-loc-042',
    zoneId: 'zone-estufa-02',
    timestamp: '2026-08-15T09:15:00Z',
    type: 'nutricao',
    title: 'Nutrición Firmeza de Pared Celular y Antioxidación',
    productOrAction: 'Nitrato de Calcio + Silicato de Potasio Foliar',
    dosage: '1.8 g/L vía goteo + 1 mL/L foliar',
    gracePeriodDays: 0,
    ph: 6.30,
    ec: 1.95,
    temperature: 26.0,
    humidity: 70,
    operatorName: 'Ing. Carlos Ortiz',
    operatorRole: 'Ingeniero Agrónomo',
    severity: 'normal',
    notes: 'Pared celular gruesa para garantizar piel crocante y postcosecha duradera en el transporte.',
    verifiedHash: 'sha256_bpa_loc04_silicio'
  },
  {
    id: 'int-loc-05',
    batchId: 'batch-loc-042',
    zoneId: 'zone-estufa-02',
    timestamp: '2026-08-30T15:00:00Z',
    type: 'fitossanidade',
    title: 'Inspección de Sanidad de Locote (Ácaros y Trips)',
    productOrAction: 'Muestreo en trampas adhesivas amarillas y brotes',
    operatorName: 'Mateo González',
    operatorRole: 'Técnico de Campo',
    severity: 'normal',
    notes: 'Cero infestación de ácaro blanco. Lote en excelente estado sanitario sin necesidad de intervención química.',
    verifiedHash: 'sha256_bpa_loc05_sanidade'
  },
  {
    id: 'int-loc-06',
    batchId: 'batch-loc-042',
    zoneId: 'zone-estufa-02',
    timestamp: '2026-09-10T10:00:00Z',
    type: 'sensor_leitura',
    title: 'Manejo de Clima y Ventilación de Cortinas',
    productOrAction: 'Apertura de cortinas cenitales y accionamiento de nebulizador',
    ph: 6.22,
    ec: 2.05,
    temperature: 27.4,
    humidity: 72,
    operatorName: 'Juan Pérez',
    operatorRole: 'Operador de Invernadero',
    severity: 'normal',
    notes: 'Disipación del pico térmico del mediodía para evitar aborto floral en locote.',
    verifiedHash: 'sha256_bpa_loc06_clima'
  },
  {
    id: 'int-loc-07',
    batchId: 'batch-loc-042',
    zoneId: 'zone-estufa-02',
    timestamp: '2026-09-14T08:00:00Z',
    type: 'colheita',
    title: 'Cosecha Selectiva de Locote Verde Comercial',
    productOrAction: 'Corte con tijera sanitizada preservando 1.5cm de pedúnculo',
    dosage: '38 cajas estándar (760 kg netos cosechados)',
    operatorName: 'Juan Pérez',
    operatorRole: 'Operador de Invernadero',
    severity: 'normal',
    notes: 'Frutos pesados de 4 lóbulos, verde brillante intenso. Destinados al centro de distribución.',
    verifiedHash: 'sha256_bpa_loc07_colheita'
  }
];

