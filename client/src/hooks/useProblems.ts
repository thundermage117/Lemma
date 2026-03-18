import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import * as problemsApi from '../api/problems'
import type {
  Book,
  CreateProblemInput,
  Difficulty,
  Problem,
  ProblemStatus,
  Topic,
  UpdateProblemInput,
} from '../types'
import { createTempId, removeById, restoreLists, snapshotLists } from './optimisticCache'

function sortByCreatedAtDesc(items: Problem[]) {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function parseProblemQueryKey(key: QueryKey) {
  return {
    status: typeof key[1] === 'string' ? key[1] : undefined,
    difficulty: typeof key[2] === 'string' ? key[2] : undefined,
    topicId: typeof key[3] === 'number' ? key[3] : undefined,
    bookId: typeof key[4] === 'number' ? key[4] : undefined,
  }
}

function matchesProblemQuery(problem: Problem, key: QueryKey) {
  const { status, difficulty, topicId, bookId } = parseProblemQueryKey(key)
  if (status !== undefined && problem.status !== status) return false
  if (difficulty !== undefined && problem.difficulty !== difficulty) return false
  if (topicId !== undefined && problem.topicId !== topicId) return false
  if (bookId !== undefined && problem.linkedBookId !== bookId) return false
  return true
}

export function useProblems(filters?: {
  status?: ProblemStatus
  difficulty?: Difficulty
  topicId?: number
  bookId?: number
}) {
  const queryClient = useQueryClient()
  const activeQueryKey: QueryKey = [
    'problems',
    filters?.status,
    filters?.difficulty,
    filters?.topicId,
    filters?.bookId,
  ]

  const query = useQuery({
    queryKey: activeQueryKey,
    queryFn: () => problemsApi.getAll(filters),
  })

  const getCachedProblemQueryKeys = (): QueryKey[] => {
    const keys = queryClient.getQueriesData<Problem[]>({ queryKey: ['problems'] }).map(([key]) => key)
    return keys.length > 0 ? keys : [activeQueryKey]
  }

  const getProblemSnapshot = () => {
    const snapshot = snapshotLists<Problem>(queryClient, ['problems'])
    if (snapshot.length === 0) {
      snapshot.push([activeQueryKey, queryClient.getQueryData<Problem[]>(activeQueryKey)])
    }
    return snapshot
  }

  const getBookSummary = (bookId: number | null | undefined): Problem['book'] => {
    if (!bookId) return null
    const books = queryClient.getQueryData<Book[]>(['books']) ?? []
    const linkedBook = books.find((book) => book.id === bookId)
    return linkedBook ? { id: linkedBook.id, title: linkedBook.title } : null
  }

  const getTopicSummary = (topicId: number | null | undefined): Problem['topic'] => {
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

  const applyProblemToCache = (items: Problem[], key: QueryKey, problem: Problem) => {
    const withoutProblem = removeById(items, problem.id)
    if (!matchesProblemQuery(problem, key)) {
      return sortByCreatedAtDesc(withoutProblem)
    }
    return sortByCreatedAtDesc([problem, ...withoutProblem])
  }

  const createMutation = useMutation({
    mutationFn: problemsApi.create,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['problems'] })

      const previousProblems = getProblemSnapshot()
      const tempId = createTempId()
      const now = new Date().toISOString()
      const optimisticProblem: Problem = {
        id: tempId,
        title: input.title,
        sourceType: input.sourceType,
        linkedBookId: input.linkedBookId ?? null,
        topicId: input.topicId ?? null,
        chapterOrSection: input.chapterOrSection ?? null,
        pageNumber: input.pageNumber ?? null,
        problemStatement: input.problemStatement,
        difficulty: input.difficulty,
        tags: input.tags ?? [],
        status: input.status,
        attemptNotes: input.attemptNotes ?? null,
        finalSolution: input.finalSolution ?? null,
        mistakesMade: input.mistakesMade ?? null,
        revisitDate: input.revisitDate ?? null,
        createdAt: now,
        updatedAt: now,
        book: getBookSummary(input.linkedBookId),
        topic: getTopicSummary(input.topicId),
      }

      getCachedProblemQueryKeys().forEach((key) => {
        queryClient.setQueryData<Problem[]>(key, (current = []) =>
          applyProblemToCache(current, key, optimisticProblem)
        )
      })

      return { previousProblems, tempId }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        restoreLists(queryClient, context.previousProblems)
      }
    },
    onSuccess: (serverProblem, _variables, context) => {
      getCachedProblemQueryKeys().forEach((key) => {
        queryClient.setQueryData<Problem[]>(key, (current = []) => {
          const optimisticProblem = context ? current.find((problem) => problem.id === context.tempId) : undefined
          const merged: Problem = {
            ...optimisticProblem,
            ...serverProblem,
            book: serverProblem.book ?? optimisticProblem?.book ?? getBookSummary(serverProblem.linkedBookId),
            topic:
              serverProblem.topic ??
              optimisticProblem?.topic ??
              getTopicSummary(serverProblem.topicId),
          }

          const withoutTemp = context ? removeById(current, context.tempId) : current
          return applyProblemToCache(withoutTemp, key, merged)
        })
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateProblemInput }) => problemsApi.update(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['problems'] })

      const previousProblems = getProblemSnapshot()
      const now = new Date().toISOString()

      getCachedProblemQueryKeys().forEach((key) => {
        queryClient.setQueryData<Problem[]>(key, (current = []) => {
          const existing = current.find((problem) => problem.id === id)
          if (!existing) return current

          const optimisticProblem: Problem = {
            ...existing,
            ...input,
            updatedAt: now,
            book:
              input.linkedBookId !== undefined
                ? getBookSummary(input.linkedBookId)
                : existing.book,
            topic:
              input.topicId !== undefined
                ? getTopicSummary(input.topicId)
                : existing.topic,
          }

          return applyProblemToCache(current, key, optimisticProblem)
        })
      })

      return { previousProblems }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        restoreLists(queryClient, context.previousProblems)
      }
    },
    onSuccess: (serverProblem) => {
      getCachedProblemQueryKeys().forEach((key) => {
        queryClient.setQueryData<Problem[]>(key, (current = []) => {
          const existing = current.find((problem) => problem.id === serverProblem.id)
          const merged: Problem = {
            ...existing,
            ...serverProblem,
            book: serverProblem.book ?? existing?.book ?? getBookSummary(serverProblem.linkedBookId),
            topic: serverProblem.topic ?? existing?.topic ?? getTopicSummary(serverProblem.topicId),
          }
          return applyProblemToCache(current, key, merged)
        })
      })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: problemsApi.remove,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['problems'] })

      const previousProblems = getProblemSnapshot()

      getCachedProblemQueryKeys().forEach((key) => {
        queryClient.setQueryData<Problem[]>(key, (current = []) => removeById(current, id))
      })

      return { previousProblems }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        restoreLists(queryClient, context.previousProblems)
      }
    },
  })

  return {
    problems: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    createProblem: (input: CreateProblemInput) => createMutation.mutateAsync(input),
    updateProblem: (id: number, input: UpdateProblemInput) => updateMutation.mutateAsync({ id, input }),
    deleteProblem: (id: number) => deleteMutation.mutateAsync(id),
  }
}
