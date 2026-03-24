# Contributing

## Branch strategy

- `main`: production-ready history
- `develop`: integration branch for day-to-day work
- `feature/<name>`: new features
- `fix/<name>`: bug fixes
- `chore/<name>`: maintenance and tooling

## Recommended flow

1. Branch from `develop`.
2. Make a focused change.
3. Run:
   - `npm run typecheck`
   - `npm run build:api`
   - `npm run build:web`
   - `npm run check:worker`
4. Open a pull request into `develop`.
5. Merge `develop` into `main` when the release is ready.

## Local setup

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm install`.
3. Create the database and apply the schema:
   - `psql 'postgresql://postgres:postgres@localhost:5432/postgres' -c 'CREATE DATABASE buyparts'`
   - `POSTGRES_URL='postgresql://postgres:postgres@localhost:5432/buyparts' npm run db:apply`
