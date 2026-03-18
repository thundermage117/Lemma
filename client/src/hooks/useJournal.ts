import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as journalApi from '../api/journal'
import type { Book, CreateJournalInput, JournalEntry, Topic, UpdateJournalInput } from '../types'
import { createTempId, removeById } from './optimisticCache'

function sortByDateDesc(items: JournalEntry[]) {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function useJournal() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['journal'],
    queryFn: journalApi.getAll,
  })

  const getBookSummary = (bookId: number | null | undefined): JournalEntry['book'] => {
    if (!bookId) return null
    const books = queryClient.getQueryData<Book[]>(['books']) ?? []
    const linkedBook = books.find((book) => book.id === bookId)
    return linkedBook ? { id: linkedBook.id, title: linkedBook.title } : null
  }

  const getTopicSummary = (topicId: number | null | undefined): JournalEntry['topic'] => {
    if (!topicId) return null

    const topicQueries = queryClient.getQueriesData<Topic[]>({ queryKey: ['topics'] })
    for (const [, topics] of topicQueries) {
      const linkedTopic = topics?.find((topic) => topic.id === topicId)
      if (linkedTopic) {
        return { id: linkedTopic.id, title: linkedTopic.title }
      }
    }

    return null
  }

  const createMutation = useMutation({
    mutationFn: journalApi.create,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['journal'] })

      const previousEntries = queryClient.getQueryData<JournalEntry[]>(['journal']) ?? []
      const tempId = createTempId()
      const now = new Date().toISOString()
      const optimisticEntry: JournalEntry = {
        id: tempId,
        date: input.date ? new Date(input.date).toISOString() : now,
        whatIStudied: input.whatIStudied,
        whatConfusedMe: input.whatConfusedMe ?? null,
        oneThingIUnderstood: input.oneThingIUnderstood ?? null,
        pagesRead: input.pagesRead ?? null,
        linkedBookId: input.linkedBookId ?? null,
        linkedTopicId: input.linkedTopicId ?? null,
        durationMinutes: input.durationMinutes ?? null,
        createdAt: now,
        updatedAt: now,
        book: getBookSummary(input.linkedBookId),
        topic: getTopicSummary(input.linkedTopicId),
      }

      queryClient.setQueryData<JournalEntry[]>(['journal'], (current = []) =>
        sortByDateDesc([optimisticEntry, ...current])
      )

      return { previousEntries, tempId }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(['journal'], context.previousEntries)
      }
    },
    onSuccess: (serverEntry, _variables, context) => {
      queryClient.setQueryData<JournalEntry[]>(['journal'], (current = []) => {
        const optimisticEntry = context ? current.find((entry) => entry.id === context.tempId) : undefined
        const merged: JournalEntry = {
          ...optimisticEntry,
          ...serverEntry,
          book: serverEntry.book ?? optimisticEntry?.book ?? getBookSummary(serverEntry.linkedBookId),
          topic: serverEntry.topic ?? optimisticEntry?.topic ?? getTopicSummary(serverEntry.linkedTopicId),
        }
        const withoutTemp = context ? removeById(current, context.tempId) : current
        return sortByDateDesc([merged, ...removeById(withoutTemp, merged.id)])
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateJournalInput }) => journalApi.update(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['journal'] })

      const previousEntries = queryClient.getQueryData<JournalEntry[]>(['journal']) ?? []
      const now = new Date().toISOString()

      queryClient.setQueryData<JournalEntry[]>(['journal'], (current = []) => {
        const next = current.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                ...input,
                date: input.date ? new Date(input.date).toISOString() : entry.date,
                updatedAt: now,
                book:
                  input.linkedBookId !== undefined
                    ? getBookSummary(input.linkedBookId)
                    : entry.book,
                topic:
                  input.linkedTopicId !== undefined
                    ? getTopicSummary(input.linkedTopicId)
                    : entry.topic,
              }
            : entry
        )

        return sortByDateDesc(next)
      })

      return { previousEntries }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(['journal'], context.previousEntries)
      }
    },
    onSuccess: (serverEntry) => {
      queryClient.setQueryData<JournalEntry[]>(['journal'], (current = []) => {
        const existing = current.find((entry) => entry.id === serverEntry.id)
        const merged: JournalEntry = {
          ...existing,
          ...serverEntry,
          book: serverEntry.book ?? existing?.book ?? getBookSummary(serverEntry.linkedBookId),
          topic: serverEntry.topic ?? existing?.topic ?? getTopicSummary(serverEntry.linkedTopicId),
        }
        return sortByDateDesc([merged, ...removeById(current, serverEntry.id)])
      })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: journalApi.remove,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['journal'] })

      const previousEntries = queryClient.getQueryData<JournalEntry[]>(['journal']) ?? []
      queryClient.setQueryData<JournalEntry[]>(['journal'], (current = []) => removeById(current, id))

      return { previousEntries }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(['journal'], context.previousEntries)
      }
    },
  })

  return {
    entries: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    createEntry: (input: CreateJournalInput) => createMutation.mutateAsync(input),
    updateEntry: (id: number, input: UpdateJournalInput) => updateMutation.mutateAsync({ id, input }),
    deleteEntry: (id: number) => deleteMutation.mutateAsync(id),
  }
}
