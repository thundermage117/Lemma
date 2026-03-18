# Architecture Overview

Lemma is a personal learning tracker with a React frontend, Express/Node.js backend, and PostgreSQL database.

## Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React + Vite + TypeScript         |
| Backend  | Express + Node.js + TypeScript    |
| ORM      | Prisma                            |
| Database | PostgreSQL (Supabase)             |
| Auth     | Supabase Auth (JWT)               |
| Hosting  | Render (API), static or local (client) |
| PDFs     | Supabase Storage or other object storage (optional), with local `/books` fallback |

## Request Flow

```
Browser (Vite / static)
  → Supabase Auth (email/password, access token)
  → Express API (Render, port 3001 locally / 10000 on Render)
    → JWT verification (Supabase JWKS)
    → Prisma ORM
      → PostgreSQL (Supabase, via PgBouncer pooler)
```

## Authentication and Authorization

- Supabase Auth issues JWT access tokens to the client.
- Client sends bearer token on every `/api/*` request.
- Express verifies JWT issuer/audience and extracts `userId` from `sub`.
- Services enforce per-user ownership by scoping all queries/mutations to `userId`.

## API Security Middleware

Express applies a baseline middleware stack before route handlers:

- `helmet` for secure HTTP headers
- CORS allowlist via `ALLOWED_ORIGINS` (same-origin is allowed automatically)
- request body size limits via `REQUEST_BODY_LIMIT`
- IP-based rate limiting on `/api/*` (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`)
- centralized API 404 + error handlers (sanitized JSON errors)

## Local Development

```
make dev-server   # Express on :3001, connects to Supabase DB
make dev-client   # Vite on :5173, proxies API to :3001
```

The local server uses the same Supabase database as production. There is no local database.

## PDF Delivery

- Reader accepts either full PDF URLs or local filenames from the `Book.pdfFilename` field.
- If `VITE_PDF_BASE_URL` is configured, filenames resolve against that base URL.
- If not configured, filenames resolve to local server static files under `/books`.
- For non-Supabase storage hosts, set `CSP_EXTRA_CONNECT_SRC` to include the storage origin.

## Architecture Decisions

See [decisions/](decisions/) for ADRs:

- [001 - SQLite to PostgreSQL migration](decisions/001-sqlite-to-postgresql.md)
- [002 - Supabase for PostgreSQL hosting](decisions/002-supabase-postgres-hosting.md)
- [003 - Render for API deployment](decisions/003-render-deployment.md)
- [004 - React Query for client-side caching](decisions/004-react-query-caching.md)
- [005 - API security middleware hardening](decisions/005-api-security-middleware-hardening.md)
- [006 - Supabase Auth and user-scoped data access](decisions/006-supabase-auth-and-user-scoped-data.md)
- [007 - User ownership migration strategy](decisions/007-user-ownership-migration-strategy.md)
- [008 - External object storage for book PDF hosting](decisions/008-cloudflare-r2-book-pdf-hosting.md)
- [009 - Optimistic UI mutations with React Query](decisions/009-optimistic-ui-mutations.md)
