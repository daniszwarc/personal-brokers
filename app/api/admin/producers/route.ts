import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession, ADMIN_PRODUCER_ID } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.producerId !== ADMIN_PRODUCER_ID) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { rows } = await pool.query(
    `SELECT id, name, email, active FROM producers ORDER BY name`
  )
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.producerId !== ADMIN_PRODUCER_ID) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { name, email } = await req.json()

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 })
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    return NextResponse.json({ error: 'El email es obligatorio.' }, { status: 400 })
  }

  const { rows } = await pool.query(
    `INSERT INTO producers (name, email) VALUES ($1, $2)
     RETURNING id, name, email, active`,
    [name.trim(), email.trim()]
  )

  return NextResponse.json(rows[0], { status: 201 })
}
