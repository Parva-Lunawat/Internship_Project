# Observability Backend

## Purpose
This package implements the backend side of Zeon Observability.

## What Lives Here
- Telemetry entities and DTOs for metrics, events, logs, and traces.
- Ingestion services for accepting telemetry from trusted application services.
- Query services for dashboard summary, endpoint metrics, buckets, bucket details, bucket insights, logs, events, traces, issues, service map, and retention diagnostics.
- Auth guards, role guards, exception filters, and compatibility helpers.
- Tests for route contracts, ingestion mapping, and query behavior.

## Navigation
- Use the ingestion module for telemetry intake behavior.
- Use the query module for dashboard and operator-facing data shapes.
- Use the telemetry module for persistence schema and compatibility behavior.
- Use common infrastructure for auth and error handling.

## Safe Setup Notes
Do not commit concrete database settings, service targets, or private access examples. Keep those values in local or deployment-managed configuration.

## Validation
Run the backend build and test suite after changing ingestion, query, auth, schema, or error behavior.

