import { useState, useEffect, useCallback } from 'react'
import * as dashboardApi from '../api/dashboard'
import type { DashboardSummary } from '../types'

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardApi.getSummary()
      setSummary(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSummary() }, [fetchSummary])

  return { summary, loading, error, refetch: fetchSummary }
}
