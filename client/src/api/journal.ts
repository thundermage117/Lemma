import { apiFetch } from './client'
import type { JournalEntry, CreateJournalInput, UpdateJournalInput } from '../types'

export const getAll = () => apiFetch<JournalEntry[]>('/journal')
export const getById = (id: number) => apiFetch<JournalEntry>(`/journal/${id}`)
export const create = (data: CreateJournalInput) =>
  apiFetch<JournalEntry>('/journal', { method: 'POST', body: JSON.stringify(data) })
export const update = (id: number, data: UpdateJournalInput) =>
  apiFetch<JournalEntry>(`/journal/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const remove = (id: number) =>
  apiFetch<void>(`/journal/${id}`, { method: 'DELETE' })
