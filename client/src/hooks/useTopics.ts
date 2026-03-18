import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import * as topicsApi from '../api/topics'
import type { Book, CreateTopicInput, Topic, UpdateTopicInput } from '../types'
import { createTempId, removeById, restoreLists, snapshotLists } from './optimisticCache'

function sortByUpdatedAtDesc(items: Topic[]) {
  return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

function parseTopicQueryKey(key: QueryKey) {
  return {
    bookId: typeof key[1] === 'number' ? key[1] : undefined,
    status: typeof key[2] === 'string' ? key[2] : undefined,
  }
}

function matchesTopicQuery(topic: Topic, key: QueryKey) {
  const { bookId, status } = parseTopicQueryKey(key)
  if (bookId !== undefined && topic.linkedBookId !== bookId) return false
  if (status !== undefined && topic.status !== status) return false
  return true
}

export function useTopics(params?: { bookId?: number; status?: string }) {
  const queryClient = useQueryClient()
  const activeQueryKey: QueryKey = ['topics', params?.bookId, params?.status]

  const query = useQuery({
    queryKey: activeQueryKey,
    queryFn: () => topicsApi.getAll(params),
  })

  const getCachedTopicQueryKeys = (): QueryKey[] => {
    const keys = queryClient.getQueriesData<Topic[]>({ queryKey: ['topics'] }).map(([key]) => key)
    return keys.length > 0 ? keys : [activeQueryKey]
  }

  const getTopicSnapshot = () => {
    const snapshot = snapshotLists<Topic>(queryClient, ['topics'])
    if (snapshot.length === 0) {
      snapshot.push([activeQueryKey, queryClient.getQueryData<Topic[]>(activeQueryKey)])
    }
    return snapshot
  }

  const getBookSummary = (bookId: number | null | undefined): Topic['book'] => {
    if (!bookId) return null
    const books = queryClient.getQueryData<Book[]>(['books']) ?? []
    const linkedBook = books.find((book) => book.id === bookId)
    return linkedBook ? { id: linkedBook.id, title: linkedBook.title } : null
  }

  const applyTopicToCache = (items: Topic[], key: QueryKey, topic: Topic) => {
    const withoutTopic = removeById(items, topic.id)
    if (!matchesTopicQuery(topic, key)) {
      return sortByUpdatedAtDesc(withoutTopic)
    }
    return sortByUpdatedAtDesc([topic, ...withoutTopic])
  }

  const createMutation = useMutation({
    mutationFn: topicsApi.create,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['topics'] })

      const previousTopics = getTopicSnapshot()
      const tempId = createTempId()
      const now = new Date().toISOString()
      const optimisticTopic: Topic = {
        id: tempId,
        title: input.title,
        subject: input.subject,
        summary: input.summary ?? null,
        notes: input.notes ?? null,
        examples: input.examples ?? null,
        confidenceLevel: input.confidenceLevel,
        linkedBookId: input.linkedBookId ?? null,
        pageStart: input.pageStart ?? null,
        pageEnd: input.pageEnd ?? null,
        status: input.status,
        createdAt: now,
        updatedAt: now,
        book: getBookSummary(input.linkedBookId),
      }

      getCachedTopicQueryKeys().forEach((key) => {
        queryClient.setQueryData<Topic[]>(key, (current = []) => applyTopicToCache(current, key, optimisticTopic))
      })

      return { previousTopics, tempId }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        restoreLists(queryClient, context.previousTopics)
      }
    },
    onSuccess: (serverTopic, _variables, context) => {
      getCachedTopicQueryKeys().forEach((key) => {
        queryClient.setQueryData<Topic[]>(key, (current = []) => {
          const optimisticTopic = context ? current.find((topic) => topic.id === context.tempId) : undefined
          const merged: Topic = {
            ...optimisticTopic,
            ...serverTopic,
            book: serverTopic.book ?? optimisticTopic?.book ?? getBookSummary(serverTopic.linkedBookId),
          }

          const withoutTemp = context ? removeById(current, context.tempId) : current
          return applyTopicToCache(withoutTemp, key, merged)
        })
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTopicInput }) => topicsApi.update(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['topics'] })

      const previousTopics = getTopicSnapshot()
      const now = new Date().toISOString()

      getCachedTopicQueryKeys().forEach((key) => {
        queryClient.setQueryData<Topic[]>(key, (current = []) => {
          const existing = current.find((topic) => topic.id === id)
          if (!existing) return current

          const optimisticTopic: Topic = {
            ...existing,
            ...input,
            updatedAt: now,
            book:
              input.linkedBookId !== undefined
                ? getBookSummary(input.linkedBookId)
                : existing.book,
          }

          return applyTopicToCache(current, key, optimisticTopic)
        })
      })

      return { previousTopics }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        restoreLists(queryClient, context.previousTopics)
      }
    },
    onSuccess: (serverTopic) => {
      getCachedTopicQueryKeys().forEach((key) => {
        queryClient.setQueryData<Topic[]>(key, (current = []) => {
          const existing = current.find((topic) => topic.id === serverTopic.id)
          const merged: Topic = {
            ...existing,
            ...serverTopic,
            book: serverTopic.book ?? existing?.book ?? getBookSummary(serverTopic.linkedBookId),
          }
          return applyTopicToCache(current, key, merged)
        })
      })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: topicsApi.remove,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['topics'] })

      const previousTopics = getTopicSnapshot()

      getCachedTopicQueryKeys().forEach((key) => {
        queryClient.setQueryData<Topic[]>(key, (current = []) => removeById(current, id))
      })

      return { previousTopics }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        restoreLists(queryClient, context.previousTopics)
      }
    },
  })

  return {
    topics: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    createTopic: (input: CreateTopicInput) => createMutation.mutateAsync(input),
    updateTopic: (id: number, input: UpdateTopicInput) => updateMutation.mutateAsync({ id, input }),
    deleteTopic: (id: number) => deleteMutation.mutateAsync(id),
  }
}
