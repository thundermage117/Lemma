import { useQuery } from '@tanstack/react-query'
import * as dashboardApi from '../api/dashboard'

export function useDashboard() {
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getSummary,
  })

  return {
    summary: query.data ?? null,
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  }
}
