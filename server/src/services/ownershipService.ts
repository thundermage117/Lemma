import { prisma } from '../lib/prisma'

export const assertBookBelongsToUser = async (userId: string, bookId: number | null | undefined) => {
  if (bookId === null || bookId === undefined) return

  const book = await prisma.book.findFirst({
    where: { id: bookId, userId },
    select: { id: true },
  })

  if (!book) {
    throw new Error('Linked book not found')
  }
}

export const assertTopicBelongsToUser = async (userId: string, topicId: number | null | undefined) => {
  if (topicId === null || topicId === undefined) return

  const topic = await prisma.topic.findFirst({
    where: { id: topicId, userId },
    select: { id: true },
  })

  if (!topic) {
    throw new Error('Linked topic not found')
  }
}
