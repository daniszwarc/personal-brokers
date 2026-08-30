import { NextResponse } from 'next/server'
import { clearSessionCookie, clearPendingCookie } from '@/lib/auth'

export async function POST() {
  await clearSessionCookie()
  await clearPendingCookie()
  return NextResponse.json({ redirect: '/login' })
}
