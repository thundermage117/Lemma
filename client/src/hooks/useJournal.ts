import { useState, useEffect, useCallback } from 'react'
import * as journalApi from '../api/journal'
import type { JournalEntry, CreateJournalInput, UpdateJournalInput } from '../types'

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await journalApi.getAll()
      setEntries(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const createEntry = useCallback(async (input: CreateJournalInput) => {
    const entry = await journalApi.create(input)
    setEntries((prev) => [entry, ...prev])
    return entry
  }, [])

  const updateEntry = useCallback(async (id: number, input: UpdateJournalInput) => {
    const entry = await journalApi.update(id, input)
    setEntries((prev) => prev.map((e) => (e.id === id ? entry : e)))
    return entry
  }, [])

  const deleteEntry = useCallback(async (id: number) => {
    await journalApi.remove(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return { entries, loading, error, refetch: fetchEntries, createEntry, updateEntry, deleteEntry }
}
