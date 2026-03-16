# Architecture Overview

Lemma is a personal learning tracker with a React frontend, Express/Node.js backend, and PostgreSQL database.

## Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React + Vite + TypeScript         |
| Backend  | Express + Node.js + TypeScript    |
| ORM      | Prisma                            |
| Database | PostgreSQL (Supabase)             |
| Hosting  | Render (API), static or local (client) |

## Request Flow

```
Browser (Vite / static)
  → Express API (Render, port 3001 locally / 10000 on Render)
    → Prisma ORM
      → PostgreSQL (Supabase, via PgBouncer pooler)
```

## Local Development

```
make dev-server   # Express on :3001, connects to Supabase DB
make dev-client   # Vite on :5173, proxies API to :3001
```

The local server uses the same Supabase database as production. There is no local database.

## Architecture Decisions

See [decisions/](decisions/) for ADRs:

- [001 - SQLite to PostgreSQL migration](decisions/001-sqlite-to-postgresql.md)
- [002 - Supabase for PostgreSQL hosting](decisions/002-supabase-postgres-hosting.md)
- [003 - Render for API deployment](decisions/003-render-deployment.md)
- [004 - React Query for client-side caching](decisions/004-react-query-caching.md)
