import { Request, Response } from 'express'
import * as journalService from '../services/journalService'

export const getAll = async (_req: Request, res: Response) => {
  try {
    const entries = await journalService.getAll()
    res.json(entries)
  } catch {
    res.status(500).json({ error: 'Failed to fetch journal entries' })
  }
}

export const getById = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const entry = await journalService.getById(id)
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' })
    res.json(entry)
  } catch {
    res.status(500).json({ error: 'Failed to fetch journal entry' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const entry = await journalService.create(req.body)
    res.status(201).json(entry)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const entry = await journalService.update(id, req.body)
    res.json(entry)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    await journalService.remove(id)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}
