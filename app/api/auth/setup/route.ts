import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import pool from '@/lib/db'
import { getPending, createSessionCookie, createPendingCookie, clearPendingCookie } from '@/lib/auth'

authenticator.options = { digits: 6, step: 30 }

export async function GET() {
  const pending = await getPending()
  if (!pending || pending.stage !== 'setup') {
    return NextResponse.json({ error: 'Sesión expirada, inicie sesión nuevamente' }, { status: 401 })
  }

  const secret = pending.totpSecret ?? authenticator.generateSecret()
  if (!pending.totpSecret) {
    await createPendingCookie({ ...pending, totpSecret: secret })
  }

  const otpauth = authenticator.keyuri(pending.email, 'Personal Brokers', secret)
  const qrDataUrl = await QRCode.toDataURL(otpauth)

  return NextResponse.json({ qrDataUrl, secret })
}

export async function POST(req: NextRequest) {
  const pending = await getPending()
  if (!pending || pending.stage !== 'setup' || !pending.totpSecret) {
    return NextResponse.json({ error: 'Sesión expirada, inicie sesión nuevamente' }, { status: 401 })
  }

  const { password, code } = await req.json()
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
  }
  if (!code) {
    return NextResponse.json({ error: 'El código es requerido' }, { status: 400 })
  }

  const valid = authenticator.verify({ token: code, secret: pending.totpSecret })
  if (!valid) {
    return NextResponse.json({ error: 'Código inválido' }, { status: 401 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const { rows } = await pool.query(
    `UPDATE producers
     SET password_hash = $1, totp_secret = $2, totp_enabled = true, last_login = now()
     WHERE id = $3
     RETURNING id, name, email`,
    [passwordHash, pending.totpSecret, pending.producerId]
  )
  const producer = rows[0]
  if (!producer) {
    return NextResponse.json({ error: 'Productor no encontrado' }, { status: 404 })
  }

  await createSessionCookie({ producerId: producer.id, name: producer.name, email: producer.email })
  await clearPendingCookie()

  return NextResponse.json({ redirect: '/' })
}
