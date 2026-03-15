import { Request, Response } from 'express'
import * as problemsService from '../services/problemsService'
import type { ProblemStatus, Difficulty } from '@prisma/client'

export const getAll = async (req: Request, res: Response) => {
  try {
    const problems = await problemsService.getAll({
      status: req.query.status as ProblemStatus | undefined,
      difficulty: req.query.difficulty as Difficulty | undefined,
      topicId: req.query.topicId ? Number(req.query.topicId) : undefined,
      bookId: req.query.bookId ? Number(req.query.bookId) : undefined,
    })
    res.json(problems)
  } catch {
    res.status(500).json({ error: 'Failed to fetch problems' })
  }
}

export const getById = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const problem = await problemsService.getById(id)
    if (!problem) return res.status(404).json({ error: 'Problem not found' })
    res.json(problem)
  } catch {
    res.status(500).json({ error: 'Failed to fetch problem' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const problem = await problemsService.create(req.body)
    res.status(201).json(problem)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const problem = await problemsService.update(id, req.body)
    res.json(problem)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    await problemsService.remove(id)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}
