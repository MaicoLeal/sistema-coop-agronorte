# Assumptions and Open Decisions

## Ambiente de Execução (Sandbox AI Studio)
Devido às restrições do ambiente de execução (Cloud Run, limitação à porta 3000, indisponibilidade do Docker Daemon para levantar Keycloak, PostgreSQL, Redis, Mosquitto e MinIO), as seguintes decisões reversíveis (ADRs) foram adotadas para o MVP:

1. **Banco de Dados**: Substituição do PostgreSQL + TimescaleDB por SQLite (libsql/better-sqlite3) local, mantendo o Drizzle ORM para facilitar futura migração para PostgreSQL.
2. **Autenticação (Keycloak)**: Substituição por autenticação baseada em JWT gerada pela própria API para simular o OIDC, mantendo a estrutura de roles/scopes.
3. **Fila (Redis + BullMQ)**: Substituição por fila em memória no backend Node.js (P-Queue ou similar).
4. **MQTT (Mosquitto)**: Integração do broker Aedes (Node.js MQTT) rodando na mesma instância/porta (via WebSockets se necessário, ou mockado internamente).
5. **Storage (MinIO)**: Armazenamento de arquivos no sistema de arquivos local (pasta `uploads/`).
6. **Backend (NestJS)**: Para adequação ao ambiente que espera um arquivo `server.ts` simples rodando Vite middleware e Express, usaremos Express com roteadores modulares e injeção de dependência simplificada, ou um setup NestJS simplificado no mesmo repositório se possível. Optou-se por Express + Vite no formato recomendado pelo ambiente.

Estas escolhas são estritamente para viabilizar a execução local e testes no ambiente atual e devem ser revertidas para a stack original em um ambiente de nuvem dedicado.
