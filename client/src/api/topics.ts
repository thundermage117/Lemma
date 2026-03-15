import { apiFetch } from './client'
import type { Topic, CreateTopicInput, UpdateTopicInput } from '../types'

export const getAll = (params?: { bookId?: number; status?: string }) => {
  const q = new URLSearchParams()
  if (params?.bookId) q.set('bookId', String(params.bookId))
  if (params?.status) q.set('status', params.status)
  const qs = q.toString() ? `?${q}` : ''
  return apiFetch<Topic[]>(`/topics${qs}`)
}
export const getById = (id: number) => apiFetch<Topic>(`/topics/${id}`)
export const create = (data: CreateTopicInput) =>
  apiFetch<Topic>('/topics', { method: 'POST', body: JSON.stringify(data) })
export const update = (id: number, data: UpdateTopicInput) =>
  apiFetch<Topic>(`/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const remove = (id: number) =>
  apiFetch<void>(`/topics/${id}`, { method: 'DELETE' })
