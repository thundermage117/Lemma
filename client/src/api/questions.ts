import { apiFetch } from './client'
import type { Question, CreateQuestionInput, UpdateQuestionInput, QuestionStatus } from '../types'

export const getAll = (status?: QuestionStatus) => {
  const qs = status ? `?status=${status}` : ''
  return apiFetch<Question[]>(`/questions${qs}`)
}
export const getById = (id: number) => apiFetch<Question>(`/questions/${id}`)
export const create = (data: CreateQuestionInput) =>
  apiFetch<Question>('/questions', { method: 'POST', body: JSON.stringify(data) })
export const update = (id: number, data: UpdateQuestionInput) =>
  apiFetch<Question>(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const remove = (id: number) =>
  apiFetch<void>(`/questions/${id}`, { method: 'DELETE' })
