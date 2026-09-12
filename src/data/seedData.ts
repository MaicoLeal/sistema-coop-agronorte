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
  AuditEntry
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
