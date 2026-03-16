# ADR 004: Client-Side Caching with React Query

## Status
Accepted

## Context
All data fetching was done with `useEffect` + `useState` in custom hooks. This meant every page navigation triggered a fresh fetch from Supabase via the Render API, causing a visible loading delay on every route change.

## Decision
Replace manual fetch hooks with `@tanstack/react-query`. The `QueryClientProvider` wraps the app in `main.tsx`. Each hook uses `useQuery` for reads and `useMutation` for writes, with cache invalidation on mutation success.

Query keys by resource:
- `['books']`, `['topics', bookId, status]`, `['problems', ...]`, `['journal']`, `['questions', status]`, `['dashboard']`

## Consequences
- First visit to a page fetches from the server (same as before)
- Subsequent visits within the same session show cached data instantly; background refetch keeps data fresh
- Cache is in-memory only — a hard page refresh clears it
- Mutations invalidate the relevant query key, triggering a background refetch
- Return interface of all hooks is unchanged, so no page components required modification
