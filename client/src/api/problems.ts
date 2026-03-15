import { apiFetch } from './client'
import type { Problem, CreateProblemInput, UpdateProblemInput, ProblemStatus, Difficulty } from '../types'

export const getAll = (params?: {
  status?: ProblemStatus
  difficulty?: Difficulty
  topicId?: number
  bookId?: number
}) => {
  const q = new URLSearchParams()
  if (params?.status) q.set('status', params.status)
  if (params?.difficulty) q.set('difficulty', params.difficulty)
  if (params?.topicId) q.set('topicId', String(params.topicId))
  if (params?.bookId) q.set('bookId', String(params.bookId))
  const qs = q.toString() ? `?${q}` : ''
  return apiFetch<Problem[]>(`/problems${qs}`)
}
export const getById = (id: number) => apiFetch<Problem>(`/problems/${id}`)
export const create = (data: CreateProblemInput) =>
  apiFetch<Problem>('/problems', { method: 'POST', body: JSON.stringify(data) })
export const update = (id: number, data: UpdateProblemInput) =>
  apiFetch<Problem>(`/problems/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const remove = (id: number) =>
  apiFetch<void>(`/problems/${id}`, { method: 'DELETE' })
