import { Request, Response } from 'express'
import * as booksService from '../services/booksService'

export const getAll = async (_req: Request, res: Response) => {
  try {
    const books = await booksService.getAll()
    res.json(books)
  } catch {
    res.status(500).json({ error: 'Failed to fetch books' })
  }
}

export const getById = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const book = await booksService.getById(id)
    if (!book) return res.status(404).json({ error: 'Book not found' })
    res.json(book)
  } catch {
    res.status(500).json({ error: 'Failed to fetch book' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const book = await booksService.create(req.body)
    res.status(201).json(book)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const book = await booksService.update(id, req.body)
    res.json(book)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    await booksService.remove(id)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
}
