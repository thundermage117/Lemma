import { ErrorRequestHandler, RequestHandler } from 'express'

type JsonSyntaxError = SyntaxError & {
  status?: number
  body?: unknown
}

const isJsonSyntaxError = (error: unknown): error is JsonSyntaxError => {
  if (!(error instanceof SyntaxError)) return false

  return (
    typeof (error as JsonSyntaxError).status === 'number' &&
    (error as JsonSyntaxError).status === 400 &&
    'body' in error
  )
}

export const apiNotFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'API route not found' })
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error)
    return
  }

  if (isJsonSyntaxError(error)) {
    res.status(400).json({ error: 'Invalid JSON payload' })
    return
  }

  if (error instanceof Error && error.message.includes('CORS')) {
    res.status(403).json({ error: 'Origin not allowed' })
    return
  }

  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
}
