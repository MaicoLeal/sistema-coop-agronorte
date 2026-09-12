# Progresso do Desenvolvimento - Sistema Coop Agronorte

## ✅ Concluído no MVP 1.0.0
- [x] **Fundação e Governança**:
  - Configuração do projeto Vite + React 19 + TypeScript + Tailwind CSS v4.
  - Multi-tenancy implementado nos modelos e dados (`tenant-agronorte-demo`).
  - Suporte completo a dois idiomas com dicionário tipado: `es-PY` (Espanhol do Paraguai - padrão) e `pt-BR` (Português).
  - RBAC com 8 papéis (`platform_admin`, `tenant_admin`, `agronomist`, `farm_manager`, `field_operator`, `packhouse_operator`, `quality_auditor`, `viewer`) e seletor rápido para homologação.
- [x] **Núcleo de Rastreabilidade e Genealogia**:
  - Grafo bidirecional `lot_link` conectando origem de mudas, plantio, colheitas, lotes embalados, estoque e expedições.
  - Balanço de biomassa e reconciliação de massa (colhido vs embalado vs descartes vs estoque vs expedido).
  - Regra de bloqueio sanitário (*Hold/Release*) com registro obrigatório de justificativa e autorização restrita.
  - Geração de QR Code padrão e tela pública segura `/trace/:token` protegendo dados confidenciais.
  - Simulador de Recall completo com identificação de compradores e download de manifesto de auditoria.
- [x] **Telemetria IoT & Microclima**:
  - Sensores para Estufa 1 (Tomate) e Estufa 2 (Locote): pH, EC, Temp do Ar, Umidade Relativa, Temp da Solução, Vazão e Nível de Tanque.
  - Cálculo automático do **VPD (Déficit de Pressão de Vapor)** em kPa.
  - Simulador de telemetria com injeção de anomalias (salto de pH/EC, sensor congelado, pico de VPD).
- [x] **Operação de Campo Offline-First**:
  - Diário de campo com checklists de turno, conferência de pH/EC, fitossanidade e higiene.
  - Fila de sincronização Outbox local com status permanente (Online/Offline) e resolução idempotente.
- [x] **Conformidade & Auditoria**:
  - Matriz normativa versionada cobrindo SENAVE (Paraguay), BPA-PY, GLOBALG.A.P. e GS1.
  - Trilha de auditoria append-only encadeada com hashes criptográficos.

---

## ⏳ Próximas Fases (Roadmap Pós-MVP)
- [ ] Integração com controladores climáticos industriais (Priva, Hoogendoorn, Ridder) via gateway físico RS-485/Modbus.
- [ ] Conexão direta com balanças seriais industriais na recepção do packing house.
- [ ] Emissão e transmissão formal de DTVe (Documento de Trânsito Vegetal eletrônico) junto aos serviços web oficiais do SENAVE.
- [ ] Exportação nativa para repositórios EPCIS 2.0 / CBV da GS1.
