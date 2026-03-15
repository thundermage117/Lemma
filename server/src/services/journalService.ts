import { prisma } from '../lib/prisma'

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

export const getAll = async () => {
  return prisma.journalEntry.findMany({
    include: {
      book: { select: { id: true, title: true } },
      topic: { select: { id: true, title: true } },
    },
    orderBy: { date: 'desc' },
  })
}

export const getById = async (id: number) => {
  return prisma.journalEntry.findUnique({
    where: { id },
    include: {
      book: { select: { id: true, title: true } },
      topic: { select: { id: true, title: true } },
    },
  })
}

export const create = async (data: JournalInput) => {
  const { date, ...rest } = data
  return prisma.journalEntry.create({
    data: {
      ...rest,
      date: date ? new Date(date) : new Date(),
    },
  })
}

export const update = async (id: number, data: Partial<JournalInput>) => {
  const { date, ...rest } = data
  return prisma.journalEntry.update({
    where: { id },
    data: {
      ...rest,
      ...(date ? { date: new Date(date) } : {}),
    },
  })
}

export const remove = async (id: number) => {
  return prisma.journalEntry.delete({ where: { id } })
}
