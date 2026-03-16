import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as booksApi from '../api/books'
import type { CreateBookInput, UpdateBookInput } from '../types'

export function useBooks() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['books'] })

  const query = useQuery({
    queryKey: ['books'],
    queryFn: booksApi.getAll,
  })

  const createMutation = useMutation({ mutationFn: booksApi.create, onSuccess: invalidate })
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateBookInput }) => booksApi.update(id, input),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({ mutationFn: booksApi.remove, onSuccess: invalidate })

  return {
    books: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    createBook: (input: CreateBookInput) => createMutation.mutateAsync(input),
    updateBook: (id: number, input: UpdateBookInput) => updateMutation.mutateAsync({ id, input }),
    deleteBook: (id: number) => deleteMutation.mutateAsync(id),
  }
}
