# Upload API Contract and Compatibility Notes

Last updated: 2026-04-24

## Endpoint
- `POST /api/v1/uploads`
- Auth: required (`JwtAuthGuard`, cookie-based session/JWT)
- Content type: `multipart/form-data`
- Field name: `file`

## Accepted MIME Types
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`
- `image/gif`

## Explicitly Rejected
- `image/svg+xml` (SVG uploads are unsupported)
- Any non-image MIME type
- Missing `file` field

## Response Contract
- Success (`201`): `{ "url": "/v1/uploads/<uuid>.<ext>" }`
- Error (`4xx`/`5xx`): backend error envelope:

```json
{
  "error": {
    "statusCode": 400,
    "category": "validation",
    "message": "Unsupported image file type",
    "path": "/api/v1/uploads",
    "method": "POST",
    "timestamp": "2026-04-24T00:00:00.000Z",
    "requestId": "..."
  }
}
```

## Compatibility Note
- Upload validation is MIME-based and intentionally does not rely on file extension checks.
- Existing clients that previously uploaded SVGs must migrate to raster formats (`png`, `jpg`, `webp`, `gif`) before calling this endpoint.
- Current frontend upload consumers are already aligned to this contract.

## Manual Validation Checklist
1. Login from frontend and keep authenticated session cookie.
2. `POST /api/v1/uploads` with `file=@image.png` and MIME `image/png`.
3. Confirm `201` and response contains `url` ending in `.png`.
4. `POST /api/v1/uploads` with `file=@vector.svg` and MIME `image/svg+xml`.
5. Confirm `400` and message `Unsupported image file type`.
6. `POST /api/v1/uploads` without `file`.
7. Confirm `400` and message `File is required` or `No file uploaded`.
