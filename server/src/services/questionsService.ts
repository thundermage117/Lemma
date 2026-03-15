import { prisma } from '../lib/prisma'

export interface QuestionInput {
  text: string
  linkedBookId?: number | null
  linkedTopicId?: number | null
  pageNumber?: number | null
  status?: string
}

export const getAll = async (status?: string) => {
  return prisma.question.findMany({
    where: status ? { status } : {},
    include: {
      book: { select: { id: true, title: true } },
      topic: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const getById = async (id: number) => {
  return prisma.question.findUnique({
    where: { id },
    include: {
      book: { select: { id: true, title: true } },
      topic: { select: { id: true, title: true } },
    },
  })
}

export const create = async (data: QuestionInput) => {
  return prisma.question.create({ data })
}

export const update = async (id: number, data: Partial<QuestionInput>) => {
  return prisma.question.update({ where: { id }, data })
}

export const remove = async (id: number) => {
  return prisma.question.delete({ where: { id } })
}
