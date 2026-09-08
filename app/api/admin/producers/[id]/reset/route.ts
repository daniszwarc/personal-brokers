import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession, ADMIN_PRODUCER_ID } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.producerId !== ADMIN_PRODUCER_ID) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params

  const { rows } = await pool.query(
    `UPDATE producers
     SET password_hash = NULL, totp_enabled = false
     WHERE id = $1
     RETURNING id, name, email, active`,
    [id]
  )

  if (!rows[0]) {
    return NextResponse.json({ error: 'Productor no encontrado' }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}
