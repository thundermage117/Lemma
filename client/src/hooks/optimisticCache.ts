import type { QueryClient, QueryKey } from '@tanstack/react-query'

export type ListSnapshot<T> = Array<[QueryKey, T[] | undefined]>

export function createTempId() {
  return -(Date.now() + Math.floor(Math.random() * 1000))
}

export function snapshotLists<T>(queryClient: QueryClient, queryKey: QueryKey): ListSnapshot<T> {
  return queryClient.getQueriesData<T[]>({ queryKey })
}

export function restoreLists<T>(queryClient: QueryClient, snapshot: ListSnapshot<T>) {
  snapshot.forEach(([key, data]) => {
    queryClient.setQueryData(key, data)
  })
}

export function replaceById<T extends { id: number }>(items: T[], item: T) {
  return items.map((candidate) => (candidate.id === item.id ? item : candidate))
}

export function replaceByIdOrPrepend<T extends { id: number }>(items: T[], item: T) {
  const found = items.some((candidate) => candidate.id === item.id)
  return found ? replaceById(items, item) : [item, ...items]
}

export function removeById<T extends { id: number }>(items: T[], id: number) {
  return items.filter((candidate) => candidate.id !== id)
}
