const fs = require('fs');
const path = require('path');

const docs = {
  'PRD.md': `# Product Requirements Document (PRD)
## Visão Geral
Sistema Coop Agronorte de Gestão e Rastreabilidade Hidropônica.
Objetivo: Rastreabilidade ponta a ponta (semente ao comprador), gestão agronômica, IoT, fertirrigação.
## Fluxo Principal
semente/muda -> lote -> manejos -> leituras -> colheita -> embalagem -> estoque -> expedição.`,
  
  'ARCHITECTURE.md': `# Architecture
Monólito modular (Express + Vite), Offline-first PWA.
- **Frontend**: React, Vite, Tailwind, offline-first com Service Worker + Dexie.
- **Backend**: Express (Node.js), Drizzle ORM, SQLite (adaptado do PostgreSQL devido ao ambiente).
- **Rastreabilidade**: Eventos imutáveis, hashes.`,
  
  'DATA_MODEL.md': `# Data Model
Entidades principais:
- Tenant, Producer, Farm, Facility, ProductionZone
- Crop, Cultivar, CropCycle, PlantBatch
- Gateway, Device, Sensor, Datastream, Observation
- HarvestBatch, PackLot, LotLink, Shipment`,
  
  'TRACEABILITY_MODEL.md': `# Traceability Model
Relação dirigida \`lot_link\`:
- origem, destino, tipo (divisão, mistura, transformação, etc.)
- Grafo bidirecional.`,

  'OFFLINE_SYNC.md': `# Offline Sync
- App salva primeiro no IndexedDB (Dexie).
- Sincronização em background via Outbox pattern.
- Pull com cursor pagination, Push com Idempotency-Key.`,

  'IOT_PROTOCOL.md': `# IoT Protocol
- Comunicação via MQTT (WebSockets no ambiente dev).
- Tópico: \`v1/{tenantId}/{farmId}/{gatewayId}/{deviceId}/{datastreamId}\`
- Formato JSON padronizado com sequence, metadata e timestamp.`,

  'SECURITY_AND_PRIVACY.md': `# Security & Privacy
- RLS simulado no código (sem Postgres RLS nativo, filtros obrigatórios por \`tenant_id\`).
- JWT auth, endpoints protegidos.`,

  'THREAT_MODEL.md': `# Threat Model (STRIDE)
- Spoofing: JWT robusto.
- Tampering: Hash em eventos de rastreabilidade.
- Repudiation: Audit log (append-only).
- Information Disclosure: RLS/Filtros rigorosos.`,

  'TEST_PLAN.md': `# Test Plan
- Unit: Vitest.
- E2E: Playwright (limitado pelo ambiente).
- IoT/Sync: Testes automatizados do worker/fila.`,

  'ROADMAP.md': `# Roadmap
- MVP (Fase Atual): PWA, gestão básica, rastreabilidade, IoT simulada.
- Fase 2: Integração com balanças e laboratório, OGC SensorThings, App nativo.`
};

for (const [filename, content] of Object.entries(docs)) {
  fs.writeFileSync(path.join('docs', filename), content);
}
console.log('Docs generated');
