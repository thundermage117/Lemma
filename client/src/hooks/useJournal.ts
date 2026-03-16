import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as journalApi from '../api/journal'
import type { CreateJournalInput, UpdateJournalInput } from '../types'

export function useJournal() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['journal'] })

  const query = useQuery({
    queryKey: ['journal'],
    queryFn: journalApi.getAll,
  })

  const createMutation = useMutation({ mutationFn: journalApi.create, onSuccess: invalidate })
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateJournalInput }) => journalApi.update(id, input),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({ mutationFn: journalApi.remove, onSuccess: invalidate })

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
