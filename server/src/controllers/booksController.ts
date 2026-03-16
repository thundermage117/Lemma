import { Request, Response } from 'express'
import * as booksService from '../services/booksService'
import { requireUserId } from './authContext'

export const getAll = async (_req: Request, res: Response) => {
  const userId = requireUserId(res)
  if (!userId) return

  try {
    const books = await booksService.getAll(userId)
    res.json(books)
  } catch {
    res.status(500).json({ error: 'Failed to fetch books' })
  }
}

export const getById = async (req: Request, res: Response) => {
  const userId = requireUserId(res)
  if (!userId) return

  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const book = await booksService.getById(userId, id)
    if (!book) return res.status(404).json({ error: 'Book not found' })
    res.json(book)
  } catch {
    res.status(500).json({ error: 'Failed to fetch book' })
  }
}

export const create = async (req: Request, res: Response) => {
  const userId = requireUserId(res)
  if (!userId) return

  try {
    const book = await booksService.create(userId, req.body)
    res.status(201).json(book)
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
    const book = await booksService.update(userId, id, req.body)
    res.json(book)
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
    await booksService.remove(userId, id)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}
