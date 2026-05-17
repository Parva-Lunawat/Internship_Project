# Load Testing

## Purpose
This workspace contains scenario runners for measuring the deployed Zeon Blogs site and its backing API.

## What Lives Here
- Scenario files for public reads, detail reads, login bursts, write bursts, upload bursts, comment creation, comment listing, and mixed traffic.
- Shared helpers for network calls, scenario timing, and summary statistics.
- A runner that executes the scenario set and writes benchmark summaries to the results directory.

## Runtime Configuration
- `SITE_URL`: Public frontend origin to test, such as the GitHub Pages deployment URL. Public page scenarios use this when provided.
- `API_BASE_URL`: Public backend API base, used for authenticated, write, upload, and comment scenarios. Falls back to `BASE_URL` for backward compatibility.
- `PAGE_TITLE`: Optional published blog slug for the detail-page scenario. If omitted, the runner tries to discover one through `API_BASE_URL`.
- `SCENARIOS`: Optional comma-separated subset such as `public_blogs,blog_detail`.
- `CONCURRENCY`, `DURATION_SEC`, `OUT_DIR`, and `OUTFILE`: Standard runner controls for load shape and result output.

## GitHub Pages Notes
- `public_blogs` targets the deployed `/blogs` page when `SITE_URL` is set.
- `blog_detail` targets `/blogs/post?pageTitle=...` on the deployed site.
- Authenticated scenarios still require a reachable public backend via `API_BASE_URL`, because GitHub Pages only hosts the frontend.
- For CI-driven authenticated scenarios, store the shared benchmark password in `LOAD_TEST_PASSWORD`.

## Navigation
- Add new traffic models as focused scenario files.
- Reuse shared helpers instead of duplicating request and statistics logic.
- Store generated benchmark summaries in the results directory.

## Safe Usage Notes
Runtime targets and private access material should be supplied locally and never committed to markdown. Reports should summarize methods and outcomes without concrete hosts or account values.
