# Observability Frontend Guide

## Purpose
This guide explains the observability dashboard behavior without exposing runtime-specific configuration.

## Dashboard Behavior
- The dashboard shell provides persistent navigation, global filters, refresh controls, and theme switching.
- Endpoint is the first filter and is selected from the backend route catalog.
- Duration defaults to All Time and can switch to relative minute, hour, or day windows.
- Refresh modes include manual, stable background refresh, and explicit live refresh.
- Widgets preserve previous data while fresh data loads to avoid page flicker.

## Bucket Behavior
- Bucket charts show request count, error count, latency, and throughput over time.
- Clicking a bucket opens a modal with request rows on the left and insight charts on the right.
- Request rows include timing, endpoint, method, status, latency, request identity, user identity, and error category when available.

## Triage Behavior
- Logs, events, traces, issues, and issue detail pages reuse the same endpoint and duration filter model.
- Issue pages group repeated failures and expose related logs, traces, events, and request samples.
- Service-flow visuals explain the movement from user request to backend handling to telemetry ingestion to dashboard visualization.

## Error and Empty States
- User-facing errors are generic and action-oriented.
- Widgets show scoped loading, empty, and error states instead of replacing the whole dashboard layout.

## Validation
Run the frontend build and tests after dashboard changes. Smoke-test filter changes, refresh behavior, bucket modal opening, issue detail navigation, and theme switching.
