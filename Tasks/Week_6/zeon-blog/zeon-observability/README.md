# Zeon Observability Workspace

This workspace contains:

- `observability-backend` (NestJS ingestion + query + diagnostics APIs)
- `observability-frontend` (Next.js live MELT dashboard)

## Quick Start

1. Configure `.env` for backend DB + JWT secrets.
2. Start observability backend on `:5100`.
3. Start observability frontend on `:5180`.
4. Set blogs-backend forwarding env values and run blogs-backend.

## Required Backend Env

- `OBS_DB_HOST`, `OBS_DB_PORT`, `OBS_DB_USERNAME`, `OBS_DB_PASSWORD`, `OBS_DB_NAME`
- `OBS_JWT_SECRET`
- `JWT_SECRET` (main backend token verification for admin dashboard)
