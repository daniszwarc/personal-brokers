import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'session'
const PENDING_COOKIE = 'pending_auth'

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no está configurado')
  return new TextEncoder().encode(secret)
}

export interface SessionPayload {
  producerId: string
  name: string
  email: string
}

export interface PendingPayload {
  producerId: string
  email: string
  stage: 'totp' | 'setup'
  totpSecret?: string
}

async function sign(payload: Record<string, unknown>, expiresIn: string) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret())
}

async function verify<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as T
  } catch {
    return null
  }
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await sign({ ...payload }, '8h')
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
}

export async function createPendingCookie(payload: PendingPayload) {
  const token = await sign({ ...payload }, '10m')
  const store = await cookies()
  store.set(PENDING_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  return verify<SessionPayload>(store.get(SESSION_COOKIE)?.value)
}

export async function getPending(): Promise<PendingPayload | null> {
  const store = await cookies()
  return verify<PendingPayload>(store.get(PENDING_COOKIE)?.value)
}

export async function clearPendingCookie() {
  const store = await cookies()
  store.delete(PENDING_COOKIE)
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function verifySessionToken(token: string | undefined) {
  return verify<SessionPayload>(token)
}

export async function verifyPendingToken(token: string | undefined) {
  return verify<PendingPayload>(token)
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
export const PENDING_COOKIE_NAME = PENDING_COOKIE
