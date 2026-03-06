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

## Tests

```bash
pnpm test
```

## Drizzle (Partie 2)

```bash
pnpm drizzle:generate
pnpm drizzle:migrate
docker exec -i db-postgres-movie psql -U postgres -d db_sandbox < seed.sql
```

Si `db_sandbox` n'existe pas deja :

```bash
docker exec -it db-postgres-movie psql -U postgres -d db -c "CREATE DATABASE db_sandbox;"
```

## Arrêter

```bash
docker compose down
```
