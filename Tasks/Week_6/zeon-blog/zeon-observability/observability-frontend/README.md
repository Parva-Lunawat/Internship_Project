# Observability Frontend

## Purpose
This package implements the operator dashboard for Zeon Observability.

## What Lives Here
- Dashboard shell, global filters, refresh controls, and theme provider.
- Pages for overview, metrics, logs, events, traces, correlation, issues, and issue details.
- Shared data table and filter components.
- Client API helpers that map backend failures to user-safe messages.
- Tests for frontend auth and client behavior.

## Navigation
- Start with the dashboard layout and shell to understand shared navigation.
- Use the filter component to understand endpoint, duration, interval, and refresh state.
- Use page folders to inspect individual dashboard surfaces.
- Use the API helper for backend request behavior and generic error mapping.

## Safe Setup Notes
Runtime endpoints and private access material should be configured outside committed markdown. Public docs should describe behavior and navigation, not concrete values.

## Validation
Run the frontend build and tests after dashboard, theme, filter, polling, or API-client changes. Smoke-test theme switching and bucket interactions after UI edits.

