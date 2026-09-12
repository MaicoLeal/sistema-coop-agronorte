# Sistema Coop Agronorte de Gestão e Rastreabilidade Hidropônica (MVP)

Sistema de missão crítica desenvolvido para a **Coop Agronorte**, focado inicialmente no cultivo protegido e hidropônico de **Tomate** e **Locote/Pimentão**, com suporte a telemetria IoT de microclima e solução nutritiva, cálculo de VPD, operação de campo *offline-first*, diário de cultivo, genealogia dirigida de lotes (`lot_link`), emissão de etiquetas QR Code com projeção pública segura e simulação completa de recall.

---

## 🚀 Arquitetura e Decisões Técnicas

- **Frontend & PWA**: React 19 + TypeScript + Vite + Tailwind CSS.
- **Rastreabilidade e Genealogia**: Grafo direcionado `lot_link` que conecta:
  `Origem Genética (Semente/Muda) ➔ Lote Produtivo ➔ Colheita ➔ Classificação/Packing ➔ Lote Comercial ➔ Caixa/Pallet ➔ Estoque ➔ Expedição ➔ Destinatário`
- **Operação Offline-First**: Motor de sincronização Outbox local com status permanente na interface (Online/Offline) e resolução auditada de operações.
- **Telemetria IoT & Microclima**:
  - Ingestão simulada de sensores via padrão MQTT com qualidade de dados (`good`, `warning`, `frozen`, `out_of_range`).
  - Cálculo contínuo do **VPD (Déficit de Pressão de Vapor)** em kPa segundo a fórmula psicrométrica de Tetens/Buck.
  - Simulador com injeção de anomalias (salto de pH/EC, sensor congelado, pico térmico de VPD).
- **Projeção Pública Segura do QR Code**:
  - Endereço público opaco `/trace/:token`.
  - Exibe dados aprovados de produto, data de colheita, certificação SENAVE/BPA e status sanitário, **sem expor** custos, nomes de trabalhadores, receitas ou dados confidenciais.
- **Governança & Auditoria**:
  - Trilha append-only com encadeamento de hashes criptográficos (`previous_hash` e `current_hash`).
  - Matriz normativa de conformidade (SENAVE, BPA-PY, GLOBALG.A.P., GS1).
  - RBAC com segregação de funções (Agrônomo, Auditor de Qualidade, Gerente de Unidade, Operador de Campo, Operador de Packing).

---

## 🛠️ Execução e Desenvolvimento

```bash
# Instalação de dependências
npm install

# Execução do servidor de desenvolvimento
npm run dev

# Verificação de tipos e lint
npm run lint

# Build de produção
npm run build
```

---

## 👤 Perfis de Teste (RBAC Integrado na Interface)

Na barra superior da aplicação, utilize o seletor de papéis para simular permissões:
- **Auditor de Qualidade (`quality_auditor`)**: Liberação/retenção preventiva de lotes (*Hold/Release*), execução de simulação de recall e auditoria normativa.
- **Engenheiro Agrônomo (`agronomist`)**: Aprovação de setpoints, receitas de fertirrigação e acompanhamento fitossanitário.
- **Gerente de Unidade (`farm_manager`)**: Gestão de lotes, expedições e movimentações de estoque.
- **Operador de Campo (`field_operator`)**: Preenchimento do diário de campo, checklists de turno e medições manuais mesmo sem sinal de rede.
- **Operador de Packing (`packhouse_operator`)**: Registro de pesagens, classificação de calibres e geração de caixas/pallets.

---

## 🌐 Internacionalização (i18n)

- **es-PY** (Espanhol do Paraguai - Padrão do projeto)
- **pt-BR** (Português do Brasil)
- Alternância instantânea no canto superior direito.

---

## 🌅 Tela principal animada

A abertura do sistema usa WebGL diretamente no navegador, sem vídeo pesado:

- a bandeira do Paraguai ondula com duas frequências de tecido e o mastro permanece estático;
- folhas e frutos recebem vento orgânico filtrado por cor e dividido em três massas de movimento;
- o amanhecer evolui durante os primeiros 9 segundos e permanece no estado iluminado;
- logo, textos, botão, mapa, estrutura da estufa e HUD ficam fora das áreas deformadas;
- o botão achatado na arte possui uma área interativa responsiva e acessível;
- `prefers-reduced-motion` desativa o WebGL e mantém a imagem estática;
- se WebGL falhar, a imagem original continua sendo exibida como fallback.

Arquivos principais:

- `src/components/AnimatedLandingPage.tsx`
- `public/assets/agronorte-hero.jpg`
- `scripts/verify-animated-landing.mjs`
- `docs/OLLAMA_DIRECAO_ANIMACAO_HOME.md`
