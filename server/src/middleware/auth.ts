import { createRemoteJWKSet, jwtVerify } from 'jose'
import { RequestHandler } from 'express'

const supabaseUrl = process.env.SUPABASE_URL?.trim()

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is required to verify Supabase JWTs')
}

const normalizedSupabaseUrl = supabaseUrl.replace(/\/$/, '')
const issuer = process.env.SUPABASE_JWT_ISSUER?.trim() || `${normalizedSupabaseUrl}/auth/v1`
const audience = process.env.SUPABASE_JWT_AUDIENCE?.trim() || 'authenticated'
const jwks = createRemoteJWKSet(new URL(`${normalizedSupabaseUrl}/auth/v1/.well-known/jwks.json`))

const getBearerToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) return null

  const [scheme, token] = authorizationHeader.split(' ')
  if (scheme !== 'Bearer' || !token) return null

  return token
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    next()
    return
  }

  const token = getBearerToken(req.headers.authorization)

  if (!token) {
    res.status(401).json({ error: 'Missing bearer token' })
    return
  }

  try {
    const { payload } = await jwtVerify(token, jwks, { issuer, audience })

    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      res.status(401).json({ error: 'Invalid token subject' })
      return
    }

    res.locals.userId = payload.sub
    res.locals.userEmail = typeof payload.email === 'string' ? payload.email : undefined
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired access token' })
  }
}
