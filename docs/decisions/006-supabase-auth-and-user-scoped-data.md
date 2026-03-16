# ADR 006: Supabase Auth and User-Scoped Data Access

## Status
Accepted

## Context
Lemma APIs were previously unauthenticated and all records were globally accessible. This made the app vulnerable to unauthorized reads/writes if the deployment URL was exposed.

The app already uses Supabase-hosted PostgreSQL, so integrating Supabase Auth avoids introducing a second identity provider.

## Decision
Adopt Supabase Auth (email/password) and enforce user-scoped access in both API and persistence layers:

- client authenticates with Supabase and stores session/access token
- client sends `Authorization: Bearer <token>` on all API calls
- Express verifies JWTs against Supabase JWKS (`SUPABASE_URL`, issuer, audience)
- API middleware requires valid JWT for all `/api/*` routes
- each domain table stores `userId` and service queries/mutations are filtered by `userId`
- linked resource references (book/topic) are validated against the same owner

## Consequences
- unauthenticated requests are rejected with `401`
- users can only read/write their own records through API-level authorization checks
- schema includes `userId` on all primary domain models
- existing pre-auth rows are backfilled to a fallback UUID and should be reassigned if needed
- client setup now requires Supabase env variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
