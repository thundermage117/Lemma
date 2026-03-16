import { Response } from 'express'

export const requireUserId = (res: Response): string | null => {
  const userId = res.locals.userId as string | undefined

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }

  return userId
}
