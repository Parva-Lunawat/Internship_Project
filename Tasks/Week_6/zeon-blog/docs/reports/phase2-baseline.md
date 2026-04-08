# Phase 2 Baseline Benchmark Report

Date: YYYY-MM-DD  
Backend commit: (fill)  
Environment: (fill: machine, OS, Node, MySQL)  

## Goals

- Establish a repeatable pre-optimization baseline.
- Identify first endpoints to degrade under load.
- Separate validation/auth failures from internal instability.

## Instrumentation Enabled

- Request logs: backend prints JSON lines with `type: "request"` to stdout.
- Optional runtime sampler: set `BENCHMARK_SAMPLER_INTERVAL_MS=1000` to print `type: "runtime"` JSON lines.
- Admin diagnostics endpoints (requires admin cookie auth):
  - `GET /api/v1/diagnostics/runtime`
  - `GET /api/v1/diagnostics/metrics`

## How To Run

1. Start backend with a fixed configuration:
   - MySQL configured (`DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`)
   - `CORS_ORIGIN` set for your load runner
   - Optional: `BENCHMARK_SAMPLER_INTERVAL_MS=1000`

2. Run scenarios (one at a time for comparability):

```powershell
$env:BASE_URL="http://localhost:3000/api/v1"
$env:CONCURRENCY="25"
$env:DURATION_SEC="60"
node load-testing/scenarios/public_blogs.mjs
node load-testing/scenarios/blog_detail.mjs
node load-testing/scenarios/login_burst.mjs
node load-testing/scenarios/write_burst.mjs
node load-testing/scenarios/upload_burst.mjs
node load-testing/scenarios/mixed_traffic.mjs
```

3. Capture outputs:
   - Save scenario summaries (each script prints one JSON line)
   - Save backend stdout (request + runtime JSON lines)

## Results Summary (Fill)

| Scenario | Concurrency | Duration(s) | RPS | p50(ms) | p95(ms) | p99(ms) | Error Rate |
|---|---:|---:|---:|---:|---:|---:|---:|
| public_blogs |  |  |  |  |  |  |  |
| blog_detail |  |  |  |  |  |  |  |
| login_burst |  |  |  |  |  |  |  |
| write_burst |  |  |  |  |  |  |  |
| upload_burst |  |  |  |  |  |  |  |
| mixed_traffic |  |  |  |  |  |  |  |

## Bottleneck Notes (Fill)

- First endpoint to hit slow threshold:
- Dominant error categories (`validation`, `auth`, `forbidden`, `internal`):
- Observed memory growth trend:
- Observed CPU trend:

## Phase 3 Candidates

- Candidate 1:
- Candidate 2:
- Candidate 3:

