import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json()
  const { status, assigned_to, accion, visible } = body
  const { id } = await params

  // Resolver "a_confirmar": fusionar con ticket existente
  if (accion === 'fusionar' && body.ref_ticket_id) {
    await pool.query(
      `INSERT INTO messages (ticket_id, fuente, contenido, direccion)
       SELECT m.ticket_id, m.fuente, m.contenido, m.direccion
       FROM messages m
       WHERE m.ticket_id = $1`,
      [id]
    )
    await pool.query(
      `UPDATE tickets SET status = 'cerrado', closed_at = NOW() WHERE id = $1`,
      [id]
    )
    return NextResponse.json({ ok: true, accion: 'fusionado' })
  }

  // Actualizar status y/o asignado
  const updates: string[] = []
  const values: (string | null)[] = []
  let i = 1

  if (status !== undefined) {
    updates.push(`status = $${i++}`)
    values.push(status)
    if (status === 'cerrado') {
      updates.push(`closed_at = NOW()`)
    }
  }

  if (assigned_to !== undefined) {
    updates.push(`assigned_to = $${i++}`)
    values.push(assigned_to)
  }

  if (visible === false) {
    updates.push(`visible = $${i++}`)
    values.push('false')
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  values.push(id)
  await pool.query(
    `UPDATE tickets SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i}`,
    values
  )

  return NextResponse.json({ ok: true })
}
