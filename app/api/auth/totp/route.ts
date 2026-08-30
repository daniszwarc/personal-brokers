import { NextRequest, NextResponse } from 'next/server'
import { authenticator } from 'otplib'
import pool from '@/lib/db'
import { getPending, createSessionCookie, clearPendingCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const pending = await getPending()
  if (!pending || pending.stage !== 'totp') {
    return NextResponse.json({ error: 'Sesión expirada, inicie sesión nuevamente' }, { status: 401 })
  }

  const { code } = await req.json()
  if (!code) {
    return NextResponse.json({ error: 'El código es requerido' }, { status: 400 })
  }

  const { rows } = await pool.query(
    `SELECT id, name, email, totp_secret FROM producers WHERE id = $1 AND active = true`,
    [pending.producerId]
  )
  const producer = rows[0]

  if (!producer || !producer.totp_secret) {
    return NextResponse.json({ error: 'Código inválido' }, { status: 401 })
  }

  authenticator.options = { digits: 6, step: 30 }
  const valid = authenticator.verify({ token: code, secret: producer.totp_secret })
  if (!valid) {
    return NextResponse.json({ error: 'Código inválido' }, { status: 401 })
  }

  await pool.query(`UPDATE producers SET last_login = now() WHERE id = $1`, [producer.id])
  await createSessionCookie({ producerId: producer.id, name: producer.name, email: producer.email })
  await clearPendingCookie()

  return NextResponse.json({ redirect: '/' })
}
