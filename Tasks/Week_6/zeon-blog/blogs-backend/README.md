# Blogs Backend

## Purpose
This package contains the NestJS backend for Zeon Blog.

## What Lives Here
- Feature modules for authentication, users, blogs, uploads, comments, health, diagnostics, and shared telemetry.
- DTOs and entities that define backend request, response, and persistence shapes.
- Unit and integration-style tests for backend behavior.
- Local generated output created by build and test commands.

## Navigation
- Start with the application module to understand composition.
- Open a feature module to inspect its controller, service, DTOs, entity, and tests together.
- Use shared infrastructure folders for guards, filters, middleware, and telemetry helpers.

## Safe Setup Notes
Runtime configuration belongs in local, uncommitted environment files or secure deployment settings. Public markdown should describe required setup conceptually, not list concrete values.

## Validation
Run the package build and relevant backend tests before opening a PR. Add or update tests for executable logic changes.

