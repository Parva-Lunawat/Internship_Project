# Observability Backend

## Environment

- `PORT` (default: `5100`)
- `OBS_DB_HOST`, `OBS_DB_PORT`, `OBS_DB_USERNAME`, `OBS_DB_PASSWORD`, `OBS_DB_NAME`
- `OBS_JWT_SECRET` (service-token validation/signing secret)
- `JWT_SECRET` (main application admin token verification secret)
- `OBS_INGEST_JWT_ISSUER` (default: `blogs-backend`)
- `OBS_INGEST_JWT_AUDIENCE` (default: `zeon-observability`)
- `OBS_QUEUE_MAX` (default: `5000`)
- `OBS_BATCH_SIZE` (default: `200`)
- `OBS_FLUSH_MS` (default: `1000`)

## API

- Ingestion (service token):
  - `POST /api/v1/ingest/metrics`
  - `POST /api/v1/ingest/logs`
  - `POST /api/v1/ingest/events`
  - `POST /api/v1/ingest/traces`

- Query (admin token):
  - `GET /api/v1/metrics/aggregate`
  - `GET /api/v1/logs`
  - `GET /api/v1/events`
  - `GET /api/v1/traces`

- Correlation (admin token):
  - `GET /api/v1/correlation/request/:requestId`
  - `GET /api/v1/correlation/trace/:traceId`

- Diagnostics:
  - `GET /api/v1/diagnostics/health`
  - `GET /api/v1/diagnostics/runtime` (admin)
  - `GET /api/v1/diagnostics/ingestion` (admin)
