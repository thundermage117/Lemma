# ADR 005: API Security Middleware Hardening

## Status
Accepted

## Context
Lemma's API was exposed with minimal protections (`cors()` + `express.json()` only) and no centralized error middleware. This increased risk from:

- automated request flooding and endpoint abuse
- oversized or malformed request payloads
- permissive cross-origin API access
- inconsistent API error responses

The app still has no authentication/authorization, so baseline transport and request-level hardening is needed immediately while auth is implemented next.

## Decision
Add a shared Express middleware security layer for all API routes:

- `helmet` for secure HTTP response headers
- CORS allowlist via `ALLOWED_ORIGINS` (with same-origin allowed automatically)
- request body limits for JSON and URL-encoded payloads (`REQUEST_BODY_LIMIT`)
- IP-based rate limiting on `/api/*` (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`)
- disable `x-powered-by`
- centralized API 404 + error handlers for consistent/sanitized responses

Configuration is environment-driven through `server/.env`.

## Consequences
- API surface is more resilient against basic abuse and noisy traffic
- cross-origin access must be explicitly configured in production
- large request payloads are rejected earlier and more predictably
- dependency footprint increases (`helmet`, `express-rate-limit`)
- this is not a substitute for authentication and authorization; identity and per-user data access controls are still required
