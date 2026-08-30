import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'session'
const PENDING_COOKIE = 'pending_auth'

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no está configurado')
  return new TextEncoder().encode(secret)
}

async function isValid(token: string | undefined) {
  if (!token) return false
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const sessionToken = req.cookies.get(SESSION_COOKIE)?.value
  const hasSession = await isValid(sessionToken)

  if (pathname === '/login') {
    if (hasSession) return NextResponse.redirect(new URL('/', req.url))
    return NextResponse.next()
  }

  if (pathname === '/auth/totp' || pathname === '/auth/setup') {
    const pendingToken = req.cookies.get(PENDING_COOKIE)?.value
    const hasPending = await isValid(pendingToken)
    if (!hasPending && !hasSession) return NextResponse.redirect(new URL('/login', req.url))
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
