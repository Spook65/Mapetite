# Prisma migration workflow for Mapetite backend

This document describes a safe, production-friendly way to manage Postgres schema changes.
It assumes a hosted Postgres instance (Railway, Supabase, Neon, etc.) with a DATABASE_URL.

## Local setup

1. Copy `env.example` to `.env` at the project root and set a local Postgres URL:

   ```bash
   cp env.example .env
   # edit DATABASE_URL to point at your local Postgres
   ```

2. From the `server` directory, generate the Prisma client:

   ```bash
   cd server
   npx prisma generate
   ```

3. Create and apply your first dev migration:

   ```bash
   npx prisma migrate dev --name init
   ```

   This will:

   - Create a new migration in `../prisma/migrations`
   - Apply it to your local database

## Production / hosted Postgres

For production or any shared environment:

1. Set `DATABASE_URL` in the deploy environment (Railway/Supabase/Neon dashboard).
2. Build an artifact (Docker image or similar) that contains the migrations.
3. Run migrations via `prisma migrate deploy` as a one-off task _before_ or as part of the deploy:

   ```bash
   cd server
   npx prisma migrate deploy
   ```

   - This applies all pending migrations in order.
   - It is idempotent and safe to run multiple times.

## Commands summary

From the `server` directory:

- Generate client only:

  ```bash
  npm run prisma:generate
  ```

- Dev migration (local only):

  ```bash
  npm run prisma:migrate:dev -- --name your_change
  ```

- Production / CI migration:

  ```bash
  npm run prisma:migrate:deploy
  ```

## Notes

- Never run `prisma migrate dev` against a shared production database.
- Keep all secrets out of git; only the migration files live in the repo.
- If you need environment-specific overrides, prefer separate `DATABASE_URL` values per environment rather than modifying the schema.



