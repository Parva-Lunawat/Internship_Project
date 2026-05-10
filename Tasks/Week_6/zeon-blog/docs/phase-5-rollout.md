# Phase 5 Rollout

## Purpose
This document tracks how Phase 5 should be rolled out safely across the Zeon workspace.

## Rollout Sequence
1. Verify the Phase 4 baseline and keep already-working comments and observability behavior intact.
2. Harden documentation, theme behavior, generic errors, refresh behavior, and validation coverage.
3. Add publishing workflow features behind clear backend and frontend boundaries.
4. Add discovery surfaces and SEO metadata once publishing state is reliable.
5. Add reader return loops after comments, discovery, and moderation are stable.
6. Expand observability dashboards and load tests after each product surface ships.

## Current Phase 5B Slice
The first product slice extends the existing blog publishing model without renaming the slug field. Blog responses now carry additive publishing and SEO metadata, author-owned workflow actions support publish, unpublish, schedule, revision listing, and revision restore, and the frontend editor exposes the corresponding publishing and SEO controls. Public discovery outputs should include only published public content, while unlisted published content remains available through direct article resolution.

## Release Gates
- Touched backend packages build and pass relevant tests.
- Touched frontend packages build and pass relevant tests or smoke checks.
- Public documentation passes the markdown safety scan.
- User-facing error messages remain generic and helpful.
- New write paths preserve validation, ownership checks, and telemetry.
- Performance claims are backed by benchmark output or explicitly labeled as pending.

## Manual Smoke Checklist
- Blog comments render fallback avatars without external default-avatar requests.
- Blog comments show author and admin labels from backend metadata.
- Comment create, update, and delete actions do not reload the page.
- Author workflow can save drafts, publish, schedule, unpublish, list revisions, and restore a revision.
- Article pages render SEO metadata, featured image alt text, reading time, and taxonomy chips.
- Public sitemap and feed surfaces exclude unpublished and unlisted content.
- Observability dashboard loads without raw route-text toasts.
- Endpoint, duration, bucket, and refresh controls remain usable.
- Theme selection supports light, dark, and system behavior across reloads.

## Deferred Rollout Notes
The next major implementation slices should be separate PRs for moderation, discovery, audience loops, observability expansion, and load-testing expansion. Keep each PR small enough that validation evidence is meaningful.