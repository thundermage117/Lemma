import { useState, useEffect, useCallback } from 'react'
import * as booksApi from '../api/books'
import type { Book, CreateBookInput, UpdateBookInput } from '../types'

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await booksApi.getAll()
      setBooks(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBooks() }, [fetchBooks])

  const createBook = useCallback(async (input: CreateBookInput) => {
    const book = await booksApi.create(input)
    setBooks((prev) => [book, ...prev])
    return book
  }, [])

  const updateBook = useCallback(async (id: number, input: UpdateBookInput) => {
    const book = await booksApi.update(id, input)
    // If setting active, mark all others inactive locally
    if (input.isActive) {
      setBooks((prev) => prev.map((b) => ({ ...b, isActive: b.id === id ? true : false })))
    } else {
      setBooks((prev) => prev.map((b) => (b.id === id ? book : b)))
    }
    return book
  }, [])

  const deleteBook = useCallback(async (id: number) => {
    await booksApi.remove(id)
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }, [])

  return { books, loading, error, refetch: fetchBooks, createBook, updateBook, deleteBook }
}
