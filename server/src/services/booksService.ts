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

export const getAll = async () => {
  return prisma.book.findMany({ orderBy: { updatedAt: 'desc' } })
}

export const getById = async (id: number) => {
  return prisma.book.findUnique({ where: { id } })
}

export const create = async (data: BookInput) => {
  if (data.isActive) {
    return prisma.$transaction(async (tx) => {
      await tx.book.updateMany({ data: { isActive: false } })
      return tx.book.create({ data })
    })
  }
  return prisma.book.create({ data })
}

export const update = async (id: number, data: Partial<BookInput>) => {
  if (data.isActive) {
    return prisma.$transaction(async (tx) => {
      await tx.book.updateMany({ data: { isActive: false } })
      return tx.book.update({ where: { id }, data })
    })
  }
  return prisma.book.update({ where: { id }, data })
}

export const remove = async (id: number) => {
  return prisma.book.delete({ where: { id } })
}
