# ADR 007: User Ownership Migration Strategy

## Status
Accepted

## Context
After introducing authentication, all domain records needed to be scoped to a specific authenticated user. Existing tables (`Book`, `Topic`, `Problem`, `JournalEntry`, `Question`) did not include a user ownership column, and production already contained pre-auth data.

Introducing a non-null `userId` directly without a transition would fail on existing rows.

## Decision
Use a two-phase SQL migration strategy in `20260316153000_add_user_ownership`:

- add non-null `userId UUID` columns to each domain table with a temporary fallback default (`00000000-0000-0000-0000-000000000000`)
- create indexes on `userId` for all domain tables
- drop the temporary defaults after backfill so new writes must provide explicit ownership

Seed behavior is user-aware:

- `SEED_USER_ID` controls ownership of seeded records
- if unset, seed falls back to the zero UUID and logs a warning

## Consequences
- migration is safe for existing datasets because legacy rows are backfilled deterministically
- API/service layer can enforce strict `where: { userId }` scoping
- legacy rows using the fallback UUID are not visible to regular users until reassigned or reseeded
- operational rollout requires setting `SEED_USER_ID` to a real Supabase Auth user UUID when loading sample data
