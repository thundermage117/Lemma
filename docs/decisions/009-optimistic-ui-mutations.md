# ADR 009: Optimistic UI Mutations with React Query

## Status
Accepted

## Context
ADR 004 introduced React Query and initially used cache invalidation after each mutation. This kept consistency simple, but created avoidable UI latency:

- list pages waited on round-trips before reflecting create/update/delete actions
- filtered views (for example status-based lists) could feel jumpy due to full refetches
- frequent invalidations added unnecessary network traffic for small single-item changes

The app now has multiple list-heavy surfaces (`books`, `topics`, `problems`, `questions`, `journal`) where perceived responsiveness is critical.

## Decision
Adopt optimistic mutation handling in list hooks, with explicit rollback and server reconciliation.

Pattern used across list resources:

- `onMutate`: cancel in-flight queries, snapshot cached lists, and apply optimistic local update
- `onError`: restore snapshots to rollback optimistic changes
- `onSuccess`: reconcile optimistic entries with server response payload

Implementation notes:

- temporary negative IDs are used for optimistic create rows until real IDs return
- filtered query keys are updated in place so items are inserted/removed based on filter match
- relation summaries (`book`, `topic`) are preserved/merged during reconciliation to avoid UI flicker
- full-list invalidation is no longer the default strategy for these mutation paths

## Consequences
- create/update/delete interactions feel immediate on list pages
- network usage drops because single-item mutations no longer force full list refetches
- mutation logic in hooks is more complex and requires careful maintenance of rollback/reconciliation behavior
- optimistic assumptions can briefly diverge from server truth until response reconciliation occurs

