import { Request, Response } from 'express'
import * as topicsService from '../services/topicsService'
import { requireUserId } from './authContext'
export const getAll = async (req: Request, res: Response) => {
  const userId = requireUserId(res)
  if (!userId) return

  try {
    const bookId = req.query.bookId ? Number(req.query.bookId) : undefined
    const status = req.query.status as string | undefined
    const topics = await topicsService.getAll(userId, bookId, status)
    res.json(topics)
  } catch {
    res.status(500).json({ error: 'Failed to fetch topics' })
  }
}

export const getById = async (req: Request, res: Response) => {
  const userId = requireUserId(res)
  if (!userId) return

  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const topic = await topicsService.getById(userId, id)
    if (!topic) return res.status(404).json({ error: 'Topic not found' })
    res.json(topic)
  } catch {
    res.status(500).json({ error: 'Failed to fetch topic' })
  }
}

export const create = async (req: Request, res: Response) => {
  const userId = requireUserId(res)
  if (!userId) return

  try {
    const topic = await topicsService.create(userId, req.body)
    res.status(201).json(topic)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}

export const update = async (req: Request, res: Response) => {
  const userId = requireUserId(res)
  if (!userId) return

  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const topic = await topicsService.update(userId, id, req.body)
    res.json(topic)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}

export const remove = async (req: Request, res: Response) => {
  const userId = requireUserId(res)
  if (!userId) return

  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    await topicsService.remove(userId, id)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}
