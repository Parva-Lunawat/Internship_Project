# Phase 3A Observability Contract Report

## Purpose
This report summarizes the observability backend contract introduced during Phase 3A.

## Contract Summary
- Telemetry follows metrics, events, logs, and traces as primary data categories.
- Request correlation uses shared request, trace, endpoint, method, status, latency, timestamp, user, source service, event type, log level, and message fields.
- Ingestion accepts current source-service naming and a temporary legacy service-name alias for compatibility.
- Query APIs support dashboard summary, endpoint metrics, buckets, bucket detail, bucket insight, logs, events, traces, issues, known routes, service map, and retention diagnostics.

## Safety Summary
- Ingestion and query APIs are protected according to caller type.
- DTO validation rejects unknown fields.
- Retention diagnostics run in non-destructive mode by default.
- User-facing errors are generic while diagnostic detail remains available to operators.

## Validation Summary
- Tests should cover ingestion validation, source-service compatibility, filtering, duration handling, bucket generation, bucket detail, bucket insight, issue grouping, and dashboard summary.
