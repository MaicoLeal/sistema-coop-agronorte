# IA local com Ollama

O assistente Don Mateo usa o Ollama executado neste PC. O navegador chama a API Agronorte em `/api`; somente o backend conversa com `127.0.0.1:11434`. A porta do Ollama não é exposta à rede.

## Componentes

- Interface: React + Vite em `http://localhost:3000` no desenvolvimento.
- API local: Express em `http://127.0.0.1:8787`.
- IA: Ollama em `http://127.0.0.1:11434`.
- Modelo padrão: `gemma4:12b`.
- Fallback: se o Ollama estiver indisponível, Don Mateo usa as respostas básicas já existentes no navegador.

## Executar

```bash
npm install
npm run dev
```

O comando inicia a interface e a API local juntas. Para validar:

```bash
npm test
npm run lint
npm run build
curl http://127.0.0.1:3000/api/health
```

## Configuração opcional

Copie `.env.example` para `.env` somente quando precisar alterar os padrões.

- `OLLAMA_MODEL`: tag exata do modelo instalado.
- `OLLAMA_BASE_URL`: endereço local do Ollama.
- `OLLAMA_TIMEOUT_MS`: tempo máximo da consulta em milissegundos (padrão: `30000`; máximo: `2147483647`).
- `LOCAL_API_HOST`: mantenha `127.0.0.1` quando a interface Vite estiver fazendo o proxy.
- `LOCAL_API_PORT`: porta da API Agronorte.

## Segurança e limites

- Nenhuma chave de API é necessária para o Ollama local.
- A consulta enviada pelo produtor é tratada como dado, não como instrução do sistema.
- O prompt proíbe inventar sensores, diagnósticos e autorizações de produtos.
- Recomendações sobre defensivos, doses, carência e risco exigem fonte oficial vigente no Paraguai e validação de responsável técnico.
- O Ollama já está integrado ao chat textual. Diagnóstico real por imagem, RAG com documentos e banco relacional local são etapas separadas e ainda não estão concluídas.

## Próxima etapa local-first

Substituir gradualmente o `localStorage` por um banco local persistente, mantendo repositórios desacoplados para permitir migração futura. Os arquivos agrícolas devem ficar fora do diretório do código, com backup e manifesto de procedência antes da indexação RAG.
