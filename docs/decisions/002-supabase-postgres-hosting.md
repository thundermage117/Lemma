# ADR 002: PostgreSQL Hosting on Supabase

## Status
Accepted

## Context
After deciding to move to PostgreSQL, a managed hosting provider was needed. Options considered: Render's managed PostgreSQL, Railway, Neon, Supabase.

## Decision
Use Supabase for PostgreSQL hosting. Supabase offers a free tier with a persistent PostgreSQL instance, a web dashboard for inspecting data, and built-in connection pooling via PgBouncer — useful since Render free-tier instances spin down and reconnect frequently.

## Consequences
- Free tier includes 500MB storage and up to 2 projects
- PgBouncer pooling (port 6543) must be used for runtime; direct URL (port 5432) for migrations
- `PGSSLMODE=require` must be set in the environment for SSL connections to work
- If the project outgrows the free tier, Supabase Pro starts at $25/mo
