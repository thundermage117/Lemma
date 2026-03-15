import { useState, useEffect, useCallback } from 'react'
import * as topicsApi from '../api/topics'
import type { Topic, CreateTopicInput, UpdateTopicInput } from '../types'

export function useTopics(params?: { bookId?: number; status?: string }) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await topicsApi.getAll(params)
      setTopics(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [params?.bookId, params?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchTopics() }, [fetchTopics])

  const createTopic = useCallback(async (input: CreateTopicInput) => {
    const topic = await topicsApi.create(input)
    setTopics((prev) => [topic, ...prev])
    return topic
  }, [])

  const updateTopic = useCallback(async (id: number, input: UpdateTopicInput) => {
    const topic = await topicsApi.update(id, input)
    setTopics((prev) => prev.map((t) => (t.id === id ? topic : t)))
    return topic
  }, [])

  const deleteTopic = useCallback(async (id: number) => {
    await topicsApi.remove(id)
    setTopics((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { topics, loading, error, refetch: fetchTopics, createTopic, updateTopic, deleteTopic }
}
