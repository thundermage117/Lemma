import { prisma } from '../lib/prisma'
import { assertBookBelongsToUser } from './ownershipService'

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

const ensureTopicBookLinkBelongsToUser = async (userId: string, linkedBookId: number | null | undefined) => {
  await assertBookBelongsToUser(userId, linkedBookId)
}

export const getAll = async (userId: string, bookId?: number, status?: string) => {
  return prisma.topic.findMany({
    where: {
      userId,
      ...(bookId ? { linkedBookId: bookId } : {}),
      ...(status ? { status } : {}),
    },
    include: { book: { select: { id: true, title: true } } },
    orderBy: { updatedAt: 'desc' },
  })
}

export const getById = async (userId: string, id: number) => {
  return prisma.topic.findFirst({
    where: { id, userId },
    include: {
      book: { select: { id: true, title: true } },
      problems: { where: { userId }, orderBy: { createdAt: 'desc' } },
    },
  })
}

export const create = async (userId: string, data: TopicInput) => {
  await ensureTopicBookLinkBelongsToUser(userId, data.linkedBookId)
  return prisma.topic.create({ data: { ...data, userId } })
}

export const update = async (userId: string, id: number, data: Partial<TopicInput>) => {
  if (data.linkedBookId !== undefined) {
    await ensureTopicBookLinkBelongsToUser(userId, data.linkedBookId)
  }

  const result = await prisma.topic.updateMany({ where: { id, userId }, data })
  if (result.count === 0) {
    throw new Error('Topic not found')
  }

  const updatedTopic = await prisma.topic.findFirst({
    where: { id, userId },
    include: {
      book: { select: { id: true, title: true } },
      problems: { where: { userId }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!updatedTopic) {
    throw new Error('Topic not found')
  }

  return updatedTopic
}

export const remove = async (userId: string, id: number) => {
  const result = await prisma.topic.deleteMany({ where: { id, userId } })

  if (result.count === 0) {
    throw new Error('Topic not found')
  }
}
