# Zeon Observability

## Purpose
This workspace contains the standalone observability product for Zeon.

## Workspace Map
- `observability-backend/`: NestJS backend for telemetry ingestion, query APIs, route catalog, buckets, issues, service map, retention diagnostics, and auth boundaries.
- `observability-frontend/`: Next.js dashboard for summary cards, endpoint filtering, buckets, logs, events, traces, issues, service flow, refresh controls, and theme switching.

## Data Model
Observability behavior is built around metrics, events, logs, and traces. Shared request and trace identity fields allow operators to correlate dashboard cards, raw requests, logs, events, traces, and grouped issues.

## Navigation
- Start in the backend query module for dashboard and bucket behavior.
- Start in the frontend dashboard shell for filters, refresh behavior, and shared layout.
- Use telemetry entities and DTOs to understand the persistence and ingestion contract.

## Safe Setup Notes
Keep runtime values, private access material, and concrete service targets out of committed markdown. Store operational configuration in local or deployment-specific systems.

