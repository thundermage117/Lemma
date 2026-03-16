import { Request, Response } from 'express'
import * as problemsService from '../services/problemsService'
import { requireUserId } from './authContext'
export const getAll = async (req: Request, res: Response) => {
  const userId = requireUserId(res)
  if (!userId) return

  try {
    const problems = await problemsService.getAll(userId, {
      status: req.query.status as string | undefined,
      difficulty: req.query.difficulty as string | undefined,
      topicId: req.query.topicId ? Number(req.query.topicId) : undefined,
      bookId: req.query.bookId ? Number(req.query.bookId) : undefined,
    })
    res.json(problems)
  } catch {
    res.status(500).json({ error: 'Failed to fetch problems' })
  }
}

export const getById = async (req: Request, res: Response) => {
  const userId = requireUserId(res)
  if (!userId) return

  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const problem = await problemsService.getById(userId, id)
    if (!problem) return res.status(404).json({ error: 'Problem not found' })
    res.json(problem)
  } catch {
    res.status(500).json({ error: 'Failed to fetch problem' })
  }
}

export const create = async (req: Request, res: Response) => {
  const userId = requireUserId(res)
  if (!userId) return

  try {
    const problem = await problemsService.create(userId, req.body)
    res.status(201).json(problem)
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
    const problem = await problemsService.update(userId, id, req.body)
    res.json(problem)
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
    await problemsService.remove(userId, id)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}
