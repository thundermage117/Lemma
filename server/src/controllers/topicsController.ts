import { Request, Response } from 'express'
import * as topicsService from '../services/topicsService'
export const getAll = async (req: Request, res: Response) => {
  try {
    const bookId = req.query.bookId ? Number(req.query.bookId) : undefined
    const status = req.query.status as string | undefined
    const topics = await topicsService.getAll(bookId, status)
    res.json(topics)
  } catch {
    res.status(500).json({ error: 'Failed to fetch topics' })
  }
}

export const getById = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const topic = await topicsService.getById(id)
    if (!topic) return res.status(404).json({ error: 'Topic not found' })
    res.json(topic)
  } catch {
    res.status(500).json({ error: 'Failed to fetch topic' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const topic = await topicsService.create(req.body)
    res.status(201).json(topic)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const topic = await topicsService.update(id, req.body)
    res.json(topic)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    await topicsService.remove(id)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}
