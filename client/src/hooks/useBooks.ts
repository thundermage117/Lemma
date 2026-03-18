import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as booksApi from '../api/books'
import type { Book, CreateBookInput, UpdateBookInput } from '../types'
import { createTempId, removeById, replaceByIdOrPrepend } from './optimisticCache'

function sortByUpdatedAtDesc(items: Book[]) {
  return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

function normalizeActiveBook(items: Book[], activeBookId: number) {
  return items.map((book) => ({ ...book, isActive: book.id === activeBookId }))
}

export function useBooks() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['books'],
    queryFn: booksApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: booksApi.create,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['books'] })

      const previousBooks = queryClient.getQueryData<Book[]>(['books']) ?? []
      const tempId = createTempId()
      const now = new Date().toISOString()

      const optimisticBook: Book = {
        id: tempId,
        title: input.title,
        author: input.author,
        subject: input.subject,
        description: input.description ?? null,
        pdfFilename: input.pdfFilename ?? null,
        totalPages: input.totalPages ?? null,
        currentPage: input.currentPage,
        currentChapter: input.currentChapter ?? null,
        status: input.status,
        isActive: input.isActive,
        createdAt: now,
        updatedAt: now,
      }

      queryClient.setQueryData<Book[]>(['books'], (current = []) => {
        const next = [optimisticBook, ...current]
        return sortByUpdatedAtDesc(optimisticBook.isActive ? normalizeActiveBook(next, tempId) : next)
      })

      return { previousBooks, tempId }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(['books'], context.previousBooks)
      }
    },
    onSuccess: (serverBook, _variables, context) => {
      queryClient.setQueryData<Book[]>(['books'], (current = []) => {
        const withoutTemp = context ? removeById(current, context.tempId) : current
        const merged = replaceByIdOrPrepend(withoutTemp, serverBook)
        return sortByUpdatedAtDesc(serverBook.isActive ? normalizeActiveBook(merged, serverBook.id) : merged)
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateBookInput }) => booksApi.update(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['books'] })

      const previousBooks = queryClient.getQueryData<Book[]>(['books']) ?? []
      const now = new Date().toISOString()

      queryClient.setQueryData<Book[]>(['books'], (current = []) => {
        const next = current.map((book) => (book.id === id ? { ...book, ...input, updatedAt: now } : book))
        return sortByUpdatedAtDesc(input.isActive ? normalizeActiveBook(next, id) : next)
      })

      return { previousBooks }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(['books'], context.previousBooks)
      }
    },
    onSuccess: (serverBook) => {
      queryClient.setQueryData<Book[]>(['books'], (current = []) => {
        const merged = replaceByIdOrPrepend(current, serverBook)
        return sortByUpdatedAtDesc(serverBook.isActive ? normalizeActiveBook(merged, serverBook.id) : merged)
      })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: booksApi.remove,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['books'] })

      const previousBooks = queryClient.getQueryData<Book[]>(['books']) ?? []
      queryClient.setQueryData<Book[]>(['books'], (current = []) => removeById(current, id))

      return { previousBooks }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(['books'], context.previousBooks)
      }
    },
  })

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
