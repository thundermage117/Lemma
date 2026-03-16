import type { Problem } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { assertBookBelongsToUser, assertTopicBelongsToUser } from './ownershipService'

export interface ProblemInput {
  title: string
  sourceType?: string
  linkedBookId?: number | null
  topicId?: number | null
  chapterOrSection?: string
  pageNumber?: number | null
  problemStatement: string
  difficulty?: string
  tags?: string[]
  status?: string
  attemptNotes?: string
  finalSolution?: string
  mistakesMade?: string
  revisitDate?: string | null
}

type NormalizedProblem = Omit<Problem, 'tags'> & { tags: string[] }

export function normalizeProblem(p: Problem): NormalizedProblem {
  return {
    ...p,
    tags: p.tags ? p.tags.split(',').filter(Boolean) : [],
  }
}

function toDbInput(data: Partial<ProblemInput>) {
  const { tags, revisitDate, ...rest } = data
  return {
    ...rest,
    ...(tags !== undefined ? { tags: tags.join(',') } : {}),
    ...(revisitDate !== undefined
      ? { revisitDate: revisitDate ? new Date(revisitDate) : null }
      : {}),
  }
}

const validateProblemRelations = async (userId: string, data: Partial<ProblemInput>) => {
  if (data.linkedBookId !== undefined) {
    await assertBookBelongsToUser(userId, data.linkedBookId)
  }

  if (data.topicId !== undefined) {
    await assertTopicBelongsToUser(userId, data.topicId)
  }
}

export const getAll = async (
  userId: string,
  filters?: {
    status?: string
    difficulty?: string
    topicId?: number
    bookId?: number
  }
) => {
  const problems = await prisma.problem.findMany({
    where: {
      userId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.difficulty ? { difficulty: filters.difficulty } : {}),
      ...(filters?.topicId ? { topicId: filters.topicId } : {}),
      ...(filters?.bookId ? { linkedBookId: filters.bookId } : {}),
    },
    include: {
      book: { select: { id: true, title: true } },
      topic: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return problems.map(normalizeProblem)
}

export const getById = async (userId: string, id: number) => {
  const p = await prisma.problem.findFirst({
    where: { id, userId },
    include: {
      book: { select: { id: true, title: true } },
      topic: { select: { id: true, title: true } },
    },
  })
  return p ? normalizeProblem(p) : null
}

export const create = async (userId: string, data: ProblemInput) => {
  await validateProblemRelations(userId, data)

  const p = await prisma.problem.create({
    data: {
      ...toDbInput(data),
      userId,
    } as Parameters<typeof prisma.problem.create>[0]['data'],
  })

  return normalizeProblem(p)
}

export const update = async (userId: string, id: number, data: Partial<ProblemInput>) => {
  await validateProblemRelations(userId, data)

  const result = await prisma.problem.updateMany({
    where: { id, userId },
    data: toDbInput(data) as Parameters<typeof prisma.problem.update>[0]['data'],
  })

  if (result.count === 0) {
    throw new Error('Problem not found')
  }

  const updated = await prisma.problem.findFirst({ where: { id, userId } })
  if (!updated) {
    throw new Error('Problem not found')
  }

  return normalizeProblem(updated)
}

export const remove = async (userId: string, id: number) => {
  const result = await prisma.problem.deleteMany({ where: { id, userId } })

  if (result.count === 0) {
    throw new Error('Problem not found')
  }
}
