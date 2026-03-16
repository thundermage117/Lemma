import { prisma } from '../lib/prisma'
import { assertBookBelongsToUser, assertTopicBelongsToUser } from './ownershipService'

export interface QuestionInput {
  text: string
  linkedBookId?: number | null
  linkedTopicId?: number | null
  pageNumber?: number | null
  status?: string
}

const validateQuestionRelations = async (userId: string, data: Partial<QuestionInput>) => {
  if (data.linkedBookId !== undefined) {
    await assertBookBelongsToUser(userId, data.linkedBookId)
  }

  if (data.linkedTopicId !== undefined) {
    await assertTopicBelongsToUser(userId, data.linkedTopicId)
  }
}

export const getAll = async (userId: string, status?: string) => {
  return prisma.question.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    include: {
      book: { select: { id: true, title: true } },
      topic: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const getById = async (userId: string, id: number) => {
  return prisma.question.findFirst({
    where: { id, userId },
    include: {
      book: { select: { id: true, title: true } },
      topic: { select: { id: true, title: true } },
    },
  })
}

export const create = async (userId: string, data: QuestionInput) => {
  await validateQuestionRelations(userId, data)
  return prisma.question.create({ data: { ...data, userId } })
}

export const update = async (userId: string, id: number, data: Partial<QuestionInput>) => {
  await validateQuestionRelations(userId, data)

  const result = await prisma.question.updateMany({ where: { id, userId }, data })
  if (result.count === 0) {
    throw new Error('Question not found')
  }

  const updatedQuestion = await prisma.question.findFirst({
    where: { id, userId },
    include: {
      book: { select: { id: true, title: true } },
      topic: { select: { id: true, title: true } },
    },
  })

  if (!updatedQuestion) {
    throw new Error('Question not found')
  }

  return updatedQuestion
}

export const remove = async (userId: string, id: number) => {
  const result = await prisma.question.deleteMany({ where: { id, userId } })

  if (result.count === 0) {
    throw new Error('Question not found')
  }
}
