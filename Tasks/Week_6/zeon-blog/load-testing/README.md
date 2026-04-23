# Load Testing Suite (Phase 2)

This folder is intentionally outside runtime application code. It provides repeatable, versioned benchmark scenarios that emit machine-readable JSON summaries.

## Prereqs

- Node.js 18+ (for built-in `fetch`, `FormData`, `Blob`)
- Backend running (Nest) with `CORS_ORIGIN` allowing your load runner
- A MySQL database configured via backend env vars

## Common Environment Variables

- `BASE_URL` (default: `http://localhost:5000/api/v1`)
- `CONCURRENCY` (default: `10`)
- `DURATION_SEC` (default: `30`)
- `OUTFILE` (optional: write JSON summary to this path)
- `EMAIL` / `PASSWORD` (used for auth scenarios)

## Scenarios

- `node load-testing/scenarios/public_blogs.mjs`
- `node load-testing/scenarios/blog_detail.mjs`
- `node load-testing/scenarios/login_burst.mjs`
- `node load-testing/scenarios/write_burst.mjs`
- `node load-testing/scenarios/upload_burst.mjs`
- `node load-testing/scenarios/mixed_traffic.mjs`

## Output

Each run prints a single JSON object with:

- `scenario`, `startedAt`, `endedAt`, `baseUrl`
- `requests`, `errors`, `errorRate`
- `latencyMs` with `avg`, `p50`, `p95`, `p99`, `min`, `max`
- `throughput` with `rps`

