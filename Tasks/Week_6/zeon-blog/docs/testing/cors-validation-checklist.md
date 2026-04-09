# CORS Manual Validation Checklist

Purpose: validate the CORS behavior introduced in `blogs-backend/src/main.ts`.

## Environment Setup

1. Start backend:
   - `cd Tasks/Week_6/zeon-blog/blogs-backend`
   - `npm run start:dev`
2. Confirm API is available:
   - `curl http://localhost:5000/api/v1/health`

## Scenario A: Development default (no `CORS_ORIGIN`)

1. Ensure `CORS_ORIGIN` is unset.
2. Send preflight from any origin:
   - `curl -i -X OPTIONS http://localhost:5000/api/v1/auth/login -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST"`
3. Repeat with a non-local origin:
   - `curl -i -X OPTIONS http://localhost:5000/api/v1/auth/login -H "Origin: https://example.com" -H "Access-Control-Request-Method: POST"`
4. Expected:
   - Both preflights return success (2xx/204) in development fallback mode.
   - Response includes `Access-Control-Allow-Origin` matching request origin.

## Scenario B: Explicit allowlist

1. Set:
   - `CORS_ORIGIN=http://localhost:5173,https://app.example.com`
2. Restart backend.
3. Allowed origin preflight:
   - `curl -i -X OPTIONS http://localhost:5000/api/v1/auth/login -H "Origin: https://app.example.com" -H "Access-Control-Request-Method: POST"`
4. Blocked origin preflight:
   - `curl -i -X OPTIONS http://localhost:5000/api/v1/auth/login -H "Origin: https://evil.example" -H "Access-Control-Request-Method: POST"`
5. Expected:
   - Allowed origin succeeds with CORS headers.
   - Blocked origin is rejected (no allow-origin header / error path).

## Scenario C: Production safety

1. Set:
   - `NODE_ENV=production`
   - unset `CORS_ORIGIN`
2. Start backend.
3. Expected:
   - App fails to boot with clear error:
   - `CORS_ORIGIN must be set in production (comma-separated origins).`
