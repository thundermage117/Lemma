import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import * as questionsApi from '../api/questions'
import type {
  Book,
  CreateQuestionInput,
  Question,
  QuestionStatus,
  Topic,
  UpdateQuestionInput,
} from '../types'
import { createTempId, removeById, restoreLists, snapshotLists } from './optimisticCache'

function sortByCreatedAtDesc(items: Question[]) {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function parseQuestionQueryKey(key: QueryKey) {
  return {
    status: typeof key[1] === 'string' ? key[1] : undefined,
  }
}

function matchesQuestionQuery(question: Question, key: QueryKey) {
  const { status } = parseQuestionQueryKey(key)
  if (status !== undefined && question.status !== status) return false
  return true
}

export function useQuestions(status?: QuestionStatus) {
  const queryClient = useQueryClient()
  const activeQueryKey: QueryKey = ['questions', status]

  const query = useQuery({
    queryKey: activeQueryKey,
    queryFn: () => questionsApi.getAll(status),
  })

  const getCachedQuestionQueryKeys = (): QueryKey[] => {
    const keys = queryClient.getQueriesData<Question[]>({ queryKey: ['questions'] }).map(([key]) => key)
    return keys.length > 0 ? keys : [activeQueryKey]
  }

  const getQuestionSnapshot = () => {
    const snapshot = snapshotLists<Question>(queryClient, ['questions'])
    if (snapshot.length === 0) {
      snapshot.push([activeQueryKey, queryClient.getQueryData<Question[]>(activeQueryKey)])
    }
    return snapshot
  }

  const getBookSummary = (bookId: number | null | undefined): Question['book'] => {
    if (!bookId) return null
    const books = queryClient.getQueryData<Book[]>(['books']) ?? []
    const linkedBook = books.find((book) => book.id === bookId)
    return linkedBook ? { id: linkedBook.id, title: linkedBook.title } : null
  }

  const getTopicSummary = (topicId: number | null | undefined): Question['topic'] => {
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

  const applyQuestionToCache = (items: Question[], key: QueryKey, question: Question) => {
    const withoutQuestion = removeById(items, question.id)
    if (!matchesQuestionQuery(question, key)) {
      return sortByCreatedAtDesc(withoutQuestion)
    }
    return sortByCreatedAtDesc([question, ...withoutQuestion])
  }

  const createMutation = useMutation({
    mutationFn: questionsApi.create,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['questions'] })

      const previousQuestions = getQuestionSnapshot()
      const tempId = createTempId()
      const now = new Date().toISOString()
      const optimisticQuestion: Question = {
        id: tempId,
        text: input.text,
        linkedBookId: input.linkedBookId ?? null,
        linkedTopicId: input.linkedTopicId ?? null,
        pageNumber: input.pageNumber ?? null,
        status: input.status,
        createdAt: now,
        updatedAt: now,
        book: getBookSummary(input.linkedBookId),
        topic: getTopicSummary(input.linkedTopicId),
      }

      getCachedQuestionQueryKeys().forEach((key) => {
        queryClient.setQueryData<Question[]>(key, (current = []) => applyQuestionToCache(current, key, optimisticQuestion))
      })

      return { previousQuestions, tempId }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        restoreLists(queryClient, context.previousQuestions)
      }
    },
    onSuccess: (serverQuestion, _variables, context) => {
      getCachedQuestionQueryKeys().forEach((key) => {
        queryClient.setQueryData<Question[]>(key, (current = []) => {
          const optimisticQuestion = context ? current.find((question) => question.id === context.tempId) : undefined
          const merged: Question = {
            ...optimisticQuestion,
            ...serverQuestion,
            book: serverQuestion.book ?? optimisticQuestion?.book ?? getBookSummary(serverQuestion.linkedBookId),
            topic:
              serverQuestion.topic ??
              optimisticQuestion?.topic ??
              getTopicSummary(serverQuestion.linkedTopicId),
          }

          const withoutTemp = context ? removeById(current, context.tempId) : current
          return applyQuestionToCache(withoutTemp, key, merged)
        })
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateQuestionInput }) => questionsApi.update(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['questions'] })

      const previousQuestions = getQuestionSnapshot()
      const now = new Date().toISOString()

      getCachedQuestionQueryKeys().forEach((key) => {
        queryClient.setQueryData<Question[]>(key, (current = []) => {
          const existing = current.find((question) => question.id === id)
          if (!existing) return current

          const optimisticQuestion: Question = {
            ...existing,
            ...input,
            updatedAt: now,
            book:
              input.linkedBookId !== undefined
                ? getBookSummary(input.linkedBookId)
                : existing.book,
            topic:
              input.linkedTopicId !== undefined
                ? getTopicSummary(input.linkedTopicId)
                : existing.topic,
          }

          return applyQuestionToCache(current, key, optimisticQuestion)
        })
      })

      return { previousQuestions }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        restoreLists(queryClient, context.previousQuestions)
      }
    },
    onSuccess: (serverQuestion) => {
      getCachedQuestionQueryKeys().forEach((key) => {
        queryClient.setQueryData<Question[]>(key, (current = []) => {
          const existing = current.find((question) => question.id === serverQuestion.id)
          const merged: Question = {
            ...existing,
            ...serverQuestion,
            book: serverQuestion.book ?? existing?.book ?? getBookSummary(serverQuestion.linkedBookId),
            topic:
              serverQuestion.topic ??
              existing?.topic ??
              getTopicSummary(serverQuestion.linkedTopicId),
          }
          return applyQuestionToCache(current, key, merged)
        })
      })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: questionsApi.remove,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['questions'] })

      const previousQuestions = getQuestionSnapshot()

      getCachedQuestionQueryKeys().forEach((key) => {
        queryClient.setQueryData<Question[]>(key, (current = []) => removeById(current, id))
      })

      return { previousQuestions }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        restoreLists(queryClient, context.previousQuestions)
      }
    },
  })

  return {
    questions: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    createQuestion: (input: CreateQuestionInput) => createMutation.mutateAsync(input),
    updateQuestion: (id: number, input: UpdateQuestionInput) => updateMutation.mutateAsync({ id, input }),
    deleteQuestion: (id: number) => deleteMutation.mutateAsync(id),
  }
}
