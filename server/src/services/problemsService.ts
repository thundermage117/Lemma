import { prisma } from '../lib/prisma'
import type { Problem } from '@prisma/client'

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

export const getAll = async (filters?: {
  status?: string
  difficulty?: string
  topicId?: number
  bookId?: number
}) => {
  const problems = await prisma.problem.findMany({
    where: {
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

export const getById = async (id: number) => {
  const p = await prisma.problem.findUnique({
    where: { id },
    include: {
      book: { select: { id: true, title: true } },
      topic: { select: { id: true, title: true } },
    },
  })
  return p ? normalizeProblem(p) : null
}

export const create = async (data: ProblemInput) => {
  const p = await prisma.problem.create({ data: toDbInput(data) as Parameters<typeof prisma.problem.create>[0]['data'] })
  return normalizeProblem(p)
}

export const update = async (id: number, data: Partial<ProblemInput>) => {
  const p = await prisma.problem.update({
    where: { id },
    data: toDbInput(data) as Parameters<typeof prisma.problem.update>[0]['data'],
  })
  return normalizeProblem(p)
}

export const remove = async (id: number) => {
  return prisma.problem.delete({ where: { id } })
}
