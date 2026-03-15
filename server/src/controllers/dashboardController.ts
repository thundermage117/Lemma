import { Request, Response } from 'express'
import * as dashboardService from '../services/dashboardService'

export const getSummary = async (_req: Request, res: Response) => {
  try {
    const summary = await dashboardService.getSummary()
    res.json(summary)
  } catch {
    res.status(500).json({ error: 'Failed to fetch dashboard summary' })
  }
}
