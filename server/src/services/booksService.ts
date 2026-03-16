import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export interface BookInput {
  title: string
  author: string
  subject: string
  description?: string
  pdfFilename?: string
  totalPages?: number
  currentPage?: number
  currentChapter?: string
  status?: string
  isActive?: boolean
}

const setInactiveBooks = async (tx: Prisma.TransactionClient, userId: string) => {
  await tx.book.updateMany({ where: { userId }, data: { isActive: false } })
}

const findOwnedBook = async (tx: Prisma.TransactionClient, userId: string, id: number) => {
  return tx.book.findFirst({ where: { id, userId } })
}

const updateOwnedBook = async (
  tx: Prisma.TransactionClient,
  userId: string,
  id: number,
  data: Partial<BookInput>
) => {
  const result = await tx.book.updateMany({ where: { id, userId }, data })

  if (result.count === 0) {
    throw new Error('Book not found')
  }

  const updatedBook = await findOwnedBook(tx, userId, id)
  if (!updatedBook) {
    throw new Error('Book not found')
  }

  return updatedBook
}

export const getAll = async (userId: string) => {
  return prisma.book.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } })
}

export const getById = async (userId: string, id: number) => {
  return prisma.book.findFirst({ where: { id, userId } })
}

export const create = async (userId: string, data: BookInput) => {
  if (data.isActive) {
    return prisma.$transaction(async (tx) => {
      await setInactiveBooks(tx, userId)
      return tx.book.create({ data: { ...data, userId } })
    })
  }

  return prisma.book.create({ data: { ...data, userId } })
}

export const update = async (userId: string, id: number, data: Partial<BookInput>) => {
  if (data.isActive) {
    return prisma.$transaction(async (tx) => {
      await setInactiveBooks(tx, userId)
      return updateOwnedBook(tx, userId, id, data)
    })
  }

  return prisma.$transaction(async (tx) => updateOwnedBook(tx, userId, id, data))
}

export const remove = async (userId: string, id: number) => {
  const result = await prisma.book.deleteMany({ where: { id, userId } })

  if (result.count === 0) {
    throw new Error('Book not found')
  }
}
