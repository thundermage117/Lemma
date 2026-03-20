import { Request, Response } from 'express'
import * as aiService from '../services/aiService'
import { requireUserId } from './authContext'

const VALID_TYPES = ['topic', 'problem', 'question'] as const

export const enrich = async (req: Request, res: Response) => {
  const userId = requireUserId(res)
  if (!userId) return

  const { type, selectedText, bookTitle, pageNumber } = req.body

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'type must be topic, problem, or question' })
  }
  if (typeof selectedText !== 'string' || selectedText.trim().length < 5) {
    return res.status(400).json({ error: 'selectedText must be at least 5 characters' })
  }

  try {
    const result = await aiService.enrich(
      type as aiService.EnrichType,
      selectedText.trim(),
      typeof bookTitle === 'string' ? bookTitle : '',
      typeof pageNumber === 'number' ? pageNumber : 1,
    )
    res.json(result)
  } catch (err) {
    console.error('AI enrichment error:', err)
    res.status(502).json({ error: 'AI enrichment failed' })
  }
}
