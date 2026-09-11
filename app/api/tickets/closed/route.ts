import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function DELETE() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  await pool.query(
    `UPDATE tickets SET visible = false WHERE status = 'cerrado' AND assigned_to = $1`,
    [session.producerId]
  )

  return NextResponse.json({ ok: true })
}
