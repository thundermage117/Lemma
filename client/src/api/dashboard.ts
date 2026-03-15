import { apiFetch } from './client'
import type { DashboardSummary } from '../types'

export const getSummary = () => apiFetch<DashboardSummary>('/dashboard/summary')
