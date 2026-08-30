import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import pool from '@/lib/db'
import { createPendingCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
  }

  const { rows } = await pool.query(
    `SELECT id, name, email, password_hash, totp_enabled FROM producers WHERE email = $1 AND active = true`,
    [email]
  )
  const producer = rows[0]

  if (!producer || !producer.password_hash) {
    return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, producer.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
  }

  if (!producer.totp_enabled) {
    await createPendingCookie({ producerId: producer.id, email: producer.email, stage: 'setup' })
    return NextResponse.json({ redirect: '/auth/setup' })
  }

  await createPendingCookie({ producerId: producer.id, email: producer.email, stage: 'totp' })
  return NextResponse.json({ redirect: '/auth/totp' })
}
