import { Request, Response } from 'express'
import * as questionsService from '../services/questionsService'
export const getAll = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined
    const questions = await questionsService.getAll(status)
    res.json(questions)
  } catch {
    res.status(500).json({ error: 'Failed to fetch questions' })
  }
}

export const getById = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const question = await questionsService.getById(id)
    if (!question) return res.status(404).json({ error: 'Question not found' })
    res.json(question)
  } catch {
    res.status(500).json({ error: 'Failed to fetch question' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const question = await questionsService.create(req.body)
    res.status(201).json(question)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const question = await questionsService.update(id, req.body)
    res.json(question)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    await questionsService.remove(id)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}
