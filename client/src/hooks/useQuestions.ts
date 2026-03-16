import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as questionsApi from '../api/questions'
import type { CreateQuestionInput, UpdateQuestionInput, QuestionStatus } from '../types'

export function useQuestions(status?: QuestionStatus) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['questions'] })

  const query = useQuery({
    queryKey: ['questions', status],
    queryFn: () => questionsApi.getAll(status),
  })

  const createMutation = useMutation({ mutationFn: questionsApi.create, onSuccess: invalidate })
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateQuestionInput }) => questionsApi.update(id, input),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({ mutationFn: questionsApi.remove, onSuccess: invalidate })

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
