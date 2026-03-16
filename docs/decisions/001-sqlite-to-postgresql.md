# ADR 001: Migrate from SQLite to PostgreSQL

## Status
Accepted

## Context
The app was initially built with SQLite using Prisma. SQLite stores data in a local file, which works fine in development but breaks in cloud deployment environments like Render, where the filesystem is ephemeral — any data written to disk is lost on redeploy or restart.

## Decision
Migrate to PostgreSQL hosted on Supabase. Supabase provides a managed PostgreSQL instance with a free tier, connection pooling via PgBouncer, and a direct connection URL for migrations.

Two connection strings are used in the Prisma schema:
- `DATABASE_URL` — pooled connection (via PgBouncer, port 6543) for runtime queries
- `DIRECT_URL` — direct connection (port 5432) for Prisma migrations, which don't work through a pooler

## Consequences
- Data persists across deploys and restarts
- Prisma schema `provider` changed from `sqlite` to `postgresql`
- Local development now connects to the remote Supabase instance (no local DB setup needed)
- Free Supabase tier has connection limits; PgBouncer pooling mitigates this
