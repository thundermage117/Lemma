import { apiFetch } from './client'
import type { Book, CreateBookInput, UpdateBookInput } from '../types'

export const getAll = () => apiFetch<Book[]>('/books')
export const getById = (id: number) => apiFetch<Book>(`/books/${id}`)
export const create = (data: CreateBookInput) =>
  apiFetch<Book>('/books', { method: 'POST', body: JSON.stringify(data) })
export const update = (id: number, data: UpdateBookInput) =>
  apiFetch<Book>(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const remove = (id: number) =>
  apiFetch<void>(`/books/${id}`, { method: 'DELETE' })
