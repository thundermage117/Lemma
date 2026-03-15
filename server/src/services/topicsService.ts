import { prisma } from '../lib/prisma'

export interface TopicInput {
  title: string
  subject: string
  summary?: string
  notes?: string
  examples?: string
  confidenceLevel?: number
  linkedBookId?: number | null
  pageStart?: number | null
  pageEnd?: number | null
  status?: string
}

export const getAll = async (bookId?: number, status?: string) => {
  return prisma.topic.findMany({
    where: {
      ...(bookId ? { linkedBookId: bookId } : {}),
      ...(status ? { status } : {}),
    },
    include: { book: { select: { id: true, title: true } } },
    orderBy: { updatedAt: 'desc' },
  })
}

export const getById = async (id: number) => {
  return prisma.topic.findUnique({
    where: { id },
    include: {
      book: { select: { id: true, title: true } },
      problems: { orderBy: { createdAt: 'desc' } },
    },
  })
}

export const create = async (data: TopicInput) => {
  return prisma.topic.create({ data })
}

export const update = async (id: number, data: Partial<TopicInput>) => {
  return prisma.topic.update({ where: { id }, data })
}

export const remove = async (id: number) => {
  return prisma.topic.delete({ where: { id } })
}
