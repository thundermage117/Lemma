import { Request, Response } from 'express'
import * as dashboardService from '../services/dashboardService'
import { requireUserId } from './authContext'

export const getSummary = async (_req: Request, res: Response) => {
  const userId = requireUserId(res)
  if (!userId) return

  try {
    const summary = await dashboardService.getSummary(userId)
    res.json(summary)
  } catch {
    res.status(500).json({ error: 'Failed to fetch dashboard summary' })
  }
}
