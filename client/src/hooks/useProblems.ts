import { useState, useEffect, useCallback } from 'react'
import * as problemsApi from '../api/problems'
import type { Problem, CreateProblemInput, UpdateProblemInput, ProblemStatus, Difficulty } from '../types'

export function useProblems(filters?: {
  status?: ProblemStatus
  difficulty?: Difficulty
  topicId?: number
  bookId?: number
}) {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await problemsApi.getAll(filters)
      setProblems(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [filters?.status, filters?.difficulty, filters?.topicId, filters?.bookId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchProblems() }, [fetchProblems])

  const createProblem = useCallback(async (input: CreateProblemInput) => {
    const problem = await problemsApi.create(input)
    setProblems((prev) => [problem, ...prev])
    return problem
  }, [])

  const updateProblem = useCallback(async (id: number, input: UpdateProblemInput) => {
    const problem = await problemsApi.update(id, input)
    setProblems((prev) => prev.map((p) => (p.id === id ? problem : p)))
    return problem
  }, [])

  const deleteProblem = useCallback(async (id: number) => {
    await problemsApi.remove(id)
    setProblems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { problems, loading, error, refetch: fetchProblems, createProblem, updateProblem, deleteProblem }
}
