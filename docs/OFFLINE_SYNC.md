# Offline Sync
- App salva primeiro no IndexedDB (Dexie).
- Sincronização em background via Outbox pattern.
- Pull com cursor pagination, Push com Idempotency-Key.