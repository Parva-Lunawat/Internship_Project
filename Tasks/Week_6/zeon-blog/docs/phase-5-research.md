# Phase 5 Research

## Purpose
This document records the safe product direction for Phase 5. It is intentionally semantic and avoids concrete runtime values.

## Product Direction
Zeon should evolve around five connected loops: publishing, discovery, discussion, retention, and measurement. The current comments and observability baseline supports that direction, but the next product increments should remain carefully sequenced.

## Priority Order
- Stabilize governed comments and moderation behavior.
- Add publishing workflow features such as drafts, previews, scheduling, and revisions.
- Improve discovery with search, author pages, taxonomy pages, and related-content rails.
- Add SEO and shareability metadata for public content surfaces.
- Add reader return loops such as bookmarks, follows, notifications, and subscription capture.
- Expand observability from technical health into content and workflow insight.

## Ownership Map
- `blogs-backend` owns business APIs, validation, authorization, persistence, and telemetry emission.
- `blogs-frontend` owns reader, author, and admin user journeys.
- `zeon-observability` owns telemetry ingestion, querying, dashboarding, issue grouping, and operational views.
- `load-testing` owns repeatable traffic scenarios and benchmark summaries.
- `docs` owns safe project notes, checklists, and rollout records.

## Safety Rules
- Do not document concrete service targets, local machine values, private access material, or raw request examples.
- Keep operational values in local or deployment-specific configuration systems.
- Use semantic API names in public docs instead of literal route contracts.
- Keep feature plans scoped enough to validate and review.