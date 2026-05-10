# Observability Backend API Guide

## Purpose
This guide describes the observability backend at a safe conceptual level for contributors and reviewers.

## Contract Areas
- Ingestion accepts metrics, events, logs, and traces from trusted services.
- Dashboard summary returns card-ready totals, latency, throughput, active endpoint, latest error, recent request, and recent incident data.
- Endpoint catalog returns known and observed route labels for dropdown filtering.
- Bucket queries return time-window aggregates for request count, error count, latency percentiles, and throughput.
- Bucket detail returns individual request rows and chart-ready distributions for the selected bucket.
- Logs, events, traces, issues, service map, and retention diagnostics support operator workflows.

## Filter Semantics
- Endpoint is the primary filter across dashboard, bucket, log, event, trace, and issue views.
- Duration defaults to All Time unless a relative window is selected.
- Relative duration supports minute, hour, and day style windows.
- Bucket grouping supports minute, hour, and day style aggregation.

## Safety Expectations
- Ingestion is restricted to trusted service callers.
- Query and dashboard data are restricted to authorized operators.
- Unknown fields are rejected by DTO validation.
- User-facing errors remain generic while diagnostic detail stays in logs.

## Validation
Regression tests should cover route registration, default duration behavior, bucket aggregation, bucket detail, issue grouping, blocked-access boundaries, and source-service compatibility.
