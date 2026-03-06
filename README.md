# TP Movie API

API HTTP en Node.js 24 + TypeScript + PostgreSQL (sans Drizzle) avec architecture:

- `Domain/`
- `Infrastructure/`
- `router.ts`
- `server.ts`

## Lancer

```bash
pnpm install
docker compose up --build -d
docker exec -i db-postgres-movie psql -U postgres -d db < schema.sql
```

API:

- `http://localhost:3001/health`
- `http://localhost:3001/movies`
- `http://localhost:3001/movies/1/screenings`
- `http://localhost:3001/movies/1/seances`

## Arrêter

```bash
docker compose down
```
