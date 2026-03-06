# TP Movie API

Mini API HTTP (Node 24 + TypeScript + PostgreSQL) avec architecture :

- `Domain/`
- `Infrastructure/`
- `router.ts`
- `server.ts`

Les repositories utilisent Drizzle ORM (SQL-first).

## Démarrage rapide

```bash
pnpm install
docker compose up --build -d
docker exec -i db-postgres-movie psql -U postgres -d db_sandbox < seed.sql
```

API disponible sur `http://localhost:3001`.

## Endpoints

- `GET /health`
- `GET /movies`
- `GET /movies/:id/screenings`
- `GET /movies/:id/seances` (alias)

## Migrations Drizzle

```bash
pnpm drizzle:generate
pnpm drizzle:migrate
```

## Tests

```bash
pnpm test
pnpm typecheck
```

## Stop

```bash
docker compose down
```
