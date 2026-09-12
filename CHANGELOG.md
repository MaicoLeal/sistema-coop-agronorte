# Changelog - Sistema Coop Agronorte

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [1.1.0] - 2026-09-10
### Adicionado
- **Versionamento Oficial na Interface**: Identificação visível e interativa da versão `v1.1.0` no cabeçalho superior, no rodapé e no novo modal de notas de versão e changelog (`VersionModal`).
- **Ajuste Visual e Ergonômico do Painel Executivo**:
  - Nova faixa contextual com dados climáticos externos da Granja Yguazú, fita de habilitação oficial SENAVE e status de homologação.
  - Cartões primários de KPI de alta densidade visual com barras de progresso para ocupação de plantas (7.200 pl) e metas de colheita diária (800 kg).
  - Chips de telemetria ao vivo integrados aos cartões de cada estufa (pH da solução, EC em mS/cm, VPD com classificação de ótimo e temperatura ambiental).
  - Filtro dinâmico de estufas ("Todas", "Estufa 01 - Tomate NFT", "Estufa 02 - Locote Substrato").
  - Painel analítico de distribuição de biomassa e rendimento por planta.
  - Cartões de alertas do turno com tipografia revisada e botões de ação rápida de campo com altura tátil de 44px.
- **Sincronização de Metadados e Dependências**: Atualização do número de versão no `package.json` para `1.1.0`.

## [1.0.0] - 2026-09-10
### Adicionado
- Criação dos artefatos de documentação de engenharia e conformidade na pasta `docs/`.
- Estrutura completa de tipos de domínio em `/src/types/index.ts`.
- Módulo de internacionalização bilíngue (`es-PY` e `pt-BR`) em `/src/i18n/translations.ts`.
- Conjunto de dados de demonstração (seed) idempotente para Tomate Saladete e Locote em `/src/data/seedData.ts`.
- Camada de persistência local com motor Outbox para modo offline em `/src/services/storageService.ts`.
- Serviço de telemetria com cálculo de VPD e injeção de anomalias em `/src/services/telemetryService.ts`.
- Serviço de geração de QR Code e resolução de projeção pública em `/src/services/qrService.ts`.
- Componentes modulares:
  - Header com seletor de tenant, perfil de usuário RBAC, modo offline e alternância de idioma.
  - Painel Executivo com indicadores de produção, estoque e alertas.
  - Painel de Telemetria e Clima com sensores em tempo real e gráficos de pacotes.
  - Árvore de Genealogia de Lotes com grafo dirigido e reconciliação de biomassa.
  - Diário de Campo para inspeções de estufa com suporte offline.
  - Módulo de Colheita e Packing com geração de caixas/pallets e travas de retenção.
  - Estoque e Expedição com emissão de guias auditadas.
  - Simulador de Recall com identificação de compradores e download de manifesto.
  - Matriz Normativa (SENAVE, BPA, GLOBALG.A.P., GS1).
  - Trilha de Auditoria com encadeamento de hashes SHA-256.
  - Página de Trazabilidade Pública do Consumidor.
