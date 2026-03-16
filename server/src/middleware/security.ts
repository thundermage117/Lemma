import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const parseAllowedOrigins = (value: string | undefined): string[] => {
  const origins = value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return origins && origins.length > 0 ? origins : DEFAULT_ALLOWED_ORIGINS
}

const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS)
const rateLimitWindowMs = parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000)
const rateLimitMaxRequests = parsePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 300)

export const trustProxyHops = process.env.NODE_ENV === 'production' ? 1 : 0
export const requestBodyLimit = process.env.REQUEST_BODY_LIMIT?.trim() || '64kb'

export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
})

const corsOptions = {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 204,
}

export const corsMiddleware = cors((req, callback) => {
  const origin = req.headers.origin
  const host = req.headers.host
  const forwardedProtoHeader = req.headers['x-forwarded-proto']
  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : forwardedProtoHeader
  const protocol = forwardedProto?.split(',')[0]?.trim() || 'http'
  const sameOrigin = Boolean(origin && host && origin === `${protocol}://${host}`)

  if (!origin || sameOrigin || allowedOrigins.includes(origin)) {
    callback(null, { ...corsOptions, origin: true })
    return
  }

  callback(new Error('CORS origin denied'))
})

export const apiRateLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  limit: rateLimitMaxRequests,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
})
