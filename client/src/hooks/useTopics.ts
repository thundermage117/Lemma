import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as topicsApi from '../api/topics'
import type { CreateTopicInput, UpdateTopicInput } from '../types'

export function useTopics(params?: { bookId?: number; status?: string }) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['topics'] })

  const query = useQuery({
    queryKey: ['topics', params?.bookId, params?.status],
    queryFn: () => topicsApi.getAll(params),
  })

  const createMutation = useMutation({ mutationFn: topicsApi.create, onSuccess: invalidate })
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTopicInput }) => topicsApi.update(id, input),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({ mutationFn: topicsApi.remove, onSuccess: invalidate })

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
