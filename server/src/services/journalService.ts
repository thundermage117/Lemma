import { prisma } from '../lib/prisma'
import { assertBookBelongsToUser, assertTopicBelongsToUser } from './ownershipService'

export interface JournalInput {
  date?: string
  whatIStudied: string
  whatConfusedMe?: string
  oneThingIUnderstood?: string
  pagesRead?: number | null
  linkedBookId?: number | null
  linkedTopicId?: number | null
  durationMinutes?: number | null
}

const validateJournalRelations = async (userId: string, data: Partial<JournalInput>) => {
  if (data.linkedBookId !== undefined) {
    await assertBookBelongsToUser(userId, data.linkedBookId)
  }

  if (data.linkedTopicId !== undefined) {
    await assertTopicBelongsToUser(userId, data.linkedTopicId)
  }
}

export const getAll = async (userId: string) => {
  return prisma.journalEntry.findMany({
    where: { userId },
    include: {
      book: { select: { id: true, title: true } },
      topic: { select: { id: true, title: true } },
    },
    orderBy: { date: 'desc' },
  })
}

export const getById = async (userId: string, id: number) => {
  return prisma.journalEntry.findFirst({
    where: { id, userId },
    include: {
      book: { select: { id: true, title: true } },
      topic: { select: { id: true, title: true } },
    },
  })
}

export const create = async (userId: string, data: JournalInput) => {
  await validateJournalRelations(userId, data)

  const { date, ...rest } = data
  return prisma.journalEntry.create({
    data: {
      ...rest,
      userId,
      date: date ? new Date(date) : new Date(),
    },
  })
}

export const update = async (userId: string, id: number, data: Partial<JournalInput>) => {
  await validateJournalRelations(userId, data)

  const { date, ...rest } = data
  const result = await prisma.journalEntry.updateMany({
    where: { id, userId },
    data: {
      ...rest,
      ...(date ? { date: new Date(date) } : {}),
    },
  })

  if (result.count === 0) {
    throw new Error('Journal entry not found')
  }

  const updatedEntry = await prisma.journalEntry.findFirst({
    where: { id, userId },
    include: {
      book: { select: { id: true, title: true } },
      topic: { select: { id: true, title: true } },
    },
  })

  if (!updatedEntry) {
    throw new Error('Journal entry not found')
  }

  return updatedEntry
}

export const remove = async (userId: string, id: number) => {
  const result = await prisma.journalEntry.deleteMany({ where: { id, userId } })

  if (result.count === 0) {
    throw new Error('Journal entry not found')
  }
}
