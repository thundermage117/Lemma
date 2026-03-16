import { prisma } from '../lib/prisma'
import { computeStreaks } from './streakService'
import { normalizeProblem } from './problemsService'

export const getSummary = async (userId: string) => {
  const [
    activeBook,
    allDates,
    totalTopics,
    totalProblems,
    unresolvedQuestions,
    recentJournalEntries,
    recentProblemsRaw,
  ] = await Promise.all([
    prisma.book.findFirst({ where: { userId, isActive: true } }),
    prisma.journalEntry.findMany({ where: { userId }, select: { date: true } }),
    prisma.topic.count({ where: { userId } }),
    prisma.problem.count({ where: { userId } }),
    prisma.question.count({ where: { userId, status: 'open' } }),
    prisma.journalEntry.findMany({
      where: { userId },
      include: {
        book: { select: { id: true, title: true } },
        topic: { select: { id: true, title: true } },
      },
      orderBy: { date: 'desc' },
      take: 3,
    }),
    prisma.problem.findMany({
      where: { userId },
      include: {
        book: { select: { id: true, title: true } },
        topic: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const { current: currentStreak, longest: longestStreak } = computeStreaks(
    allDates.map((r) => r.date)
  )

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const todayJournal = await prisma.journalEntry.findFirst({
    where: { userId, date: { gte: todayStart, lte: todayEnd } },
  })

  return {
    activeBook,
    currentStreak,
    longestStreak,
    totalTopics,
    totalProblems,
    unresolvedQuestions,
    recentJournalEntries,
    recentProblems: recentProblemsRaw.map(normalizeProblem),
    todayJournal,
  }
}
