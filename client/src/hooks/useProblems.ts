import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as problemsApi from '../api/problems'
import type { CreateProblemInput, UpdateProblemInput, ProblemStatus, Difficulty } from '../types'

export function useProblems(filters?: {
  status?: ProblemStatus
  difficulty?: Difficulty
  topicId?: number
  bookId?: number
}) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['problems'] })

  const query = useQuery({
    queryKey: ['problems', filters?.status, filters?.difficulty, filters?.topicId, filters?.bookId],
    queryFn: () => problemsApi.getAll(filters),
  })

  const createMutation = useMutation({ mutationFn: problemsApi.create, onSuccess: invalidate })
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateProblemInput }) => problemsApi.update(id, input),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({ mutationFn: problemsApi.remove, onSuccess: invalidate })

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
