import { useState, useEffect, useCallback } from 'react'
import * as questionsApi from '../api/questions'
import type { Question, CreateQuestionInput, UpdateQuestionInput, QuestionStatus } from '../types'

export function useQuestions(status?: QuestionStatus) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await questionsApi.getAll(status)
      setQuestions(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  const createQuestion = useCallback(async (input: CreateQuestionInput) => {
    const question = await questionsApi.create(input)
    setQuestions((prev) => [question, ...prev])
    return question
  }, [])

  const updateQuestion = useCallback(async (id: number, input: UpdateQuestionInput) => {
    const question = await questionsApi.update(id, input)
    setQuestions((prev) => prev.map((q) => (q.id === id ? question : q)))
    return question
  }, [])

  const deleteQuestion = useCallback(async (id: number) => {
    await questionsApi.remove(id)
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }, [])

  return { questions, loading, error, refetch: fetchQuestions, createQuestion, updateQuestion, deleteQuestion }
}
