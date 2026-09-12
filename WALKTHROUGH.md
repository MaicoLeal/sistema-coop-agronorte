# Roteiro de Demonstração e Verificação (WALKTHROUGH)

Este documento orienta o passo a passo para testar todos os critérios de aceite exigidos pelo PRD no MVP.

---

### Passo 1: Visão Executiva e Alertas
1. Acesse o **Painel Executivo**.
2. Observe os KPIs operacionais consolidados (Lotes Ativos, Plantas Ativas, Colheita do Dia, Caixas em Depósito e Alertas Críticos).
3. Verifique o banner de alerta sanitário referente ao lote em quarentena (`LOTE-TOM-2026-079-Q`).
4. Alterne o idioma entre **ES (es-PY)** e **PT (pt-BR)** no topo para verificar a internacionalização.

### Passo 2: Telemetria IoT e Simulador de Microclima
1. Clique na aba **Telemetria e Clima**.
2. Selecione a Estufa 01 (Tomate) ou Estufa 02 (Locote).
3. Observe as leituras dinâmicas de **pH**, **EC** e o **VPD Calculado** em tempo real com identificação de faixa ótima (0.8 a 1.2 kPa).
4. Na barra de controles do simulador:
   - Clique em **Injetar Anomalia de pH/EC**: observe o valor de pH subir para 7.15 e o status mudar para "Crítico / Fora da Faixa".
   - Clique em **Simular Sensor Congelado**: verifique que o pacote recebe o rótulo de qualidade `frozen`.
   - Clique em **Transmissão Normal**: o microclima restabelece a faixa estável.

### Passo 3: Genealogia do Lote e Grafo `lot_link`
1. Acesse a aba **Lotes e Genealogia**.
2. Selecione o lote `LOTE-TOM-2026-088`.
3. Veja a reconstrução da cadeia no grafo dirigido:
   `Vivero Yguazú (Origem) ➔ Lote Hidropônico ➔ Colheita COL-TOM-088-1 ➔ Lote Embalado EMB-TOM-088-CX10 ➔ Despacho Superseis`
4. Verifique o **Balanço de Massa e Reconciliação** (Colhido vs Embalado vs Descartes vs Estoque vs Expedido).
5. Clique no botão **QR** para abrir a etiqueta com QR Code gerado em alta definição.
6. Teste o botão de **Bloquear Lote (Hold)** ou **Liberar**: informe um motivo e verifique a gravação na trilha de auditoria.

### Passo 4: Diário de Campo e Operação Offline-First
1. Alterne o modo de conexão no topo para **"Sin conexión (Modo Campo)"**.
2. Acesse a aba **Cuaderno de Campo**.
3. Clique em **Nova Inspeção**, selecione o formulário de "Conferência Portátil de pH/EC", preencha os valores e clique em **Salvar no Dispositivo**.
4. Observe que o registro é gravado com o status **"Offline / Pendente"** e o contador na barra superior indica `(1)` pendente de sincronização.
5. Reative a conexão clicando no botão para **"En línea"**.
6. Clique no botão azul **Sincronizar agora**: o outbox é processado e o registro é marcado como **Sincronizado**.

### Passo 5: Colheita, Packing e Bloqueio Preventivo
1. Acesse a aba **Cosecha y Empaque**.
2. Tente registrar uma nova colheita para o lote `LOTE-TOM-2026-079-Q`: o sistema impedirá a ação, avisando que o lote está retido por quarentena sanitária.
3. Registre uma nova colheita para o lote ativo `LOTE-TOM-2026-088` e em seguida gere um lote embalado em caixas.

### Passo 6: Simulação de Recall
1. Acesse a aba **Simulador de Recall**.
2. Selecione o lote suspeito e analise a árvore de impacto:
   - Quantidade de caixas retidas em estoque na câmara fria.
   - Caixas em trânsito e compradores que receberam o produto.
3. Clique em **Executar Bloqueio Preventivo**: todas as caixas relacionadas são travadas no estoque.
4. Clique em **Descargar Manifiesto de Recall**: o arquivo JSON oficial de auditoria é baixado.

### Passo 7: Projeção Pública Segura
1. Acesse a aba **Trazabilidade Pública** (ou clique no link público de qualquer lote).
2. Veja a tela com visual amigável destinada ao consumidor final e fiscalização.
3. Confirme que nenhuma informação confidencial interna (como custos, dosagens de nutrientes ou nomes de funcionários) é exposta.

### Passo 8: Auditoria e Matriz Normativa
1. Acesse a aba **Auditoria** para verificar a cadeia encadeada de eventos e hashes.
2. Acesse a aba **Matriz Normativa** para revisar as exigências SENAVE e BPA com suas respectivas evidências.
