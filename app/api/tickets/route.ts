import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  const { rows } = await pool.query(`
    SELECT 
      t.id,
      t.ticket_number,
      t.tipo,
      t.status,
      t.poliza_ref,
      t.poliza_aseguradora,
      t.poliza_ramo,
      t.resumen,
      t.visible,
      t.fuente,
      t.ref_ticket_id,
      t.created_at,
      t.updated_at,
      c.nombre AS cliente_nombre,
      p.name   AS productor_nombre,
      p.id     AS productor_id,
      rt.ticket_number AS ref_ticket_number,
      m.contenido AS mensaje_contenido,
      m.mensaje_fecha,
      EXTRACT(EPOCH FROM (NOW() - t.updated_at))/3600 AS horas_sin_mover
    FROM tickets t
    LEFT JOIN clients  c  ON t.client_id  = c.id
    LEFT JOIN producers p ON t.assigned_to = p.id
    LEFT JOIN tickets  rt ON t.ref_ticket_id = rt.id
    LEFT JOIN LATERAL (
      SELECT contenido, created_at as mensaje_fecha
      FROM messages
      WHERE ticket_id = t.id
      ORDER BY created_at DESC
      LIMIT 1
    ) m ON true
    WHERE t.visible = true
      AND (t.status != 'cerrado'
       OR t.closed_at > NOW() - INTERVAL '24 hours')
    ORDER BY
      CASE t.status
        WHEN 'a_confirmar' THEN 1
        WHEN 'pendiente'   THEN 2
        WHEN 'en_proceso'  THEN 3
        WHEN 'cerrado'     THEN 4
      END,
      t.updated_at DESC
  `)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    cliente_nombre,
    tipo,
    poliza_ref = null,
    poliza_aseguradora = null,
    poliza_ramo = null,
    assigned_to = null,
  } = body

  if (!cliente_nombre || typeof cliente_nombre !== 'string' || !cliente_nombre.trim()) {
    return NextResponse.json({ error: 'El cliente es obligatorio.' }, { status: 400 })
  }
  if (!['alta', 'baja', 'a_definir'].includes(tipo)) {
    return NextResponse.json({ error: 'El tipo es obligatorio.' }, { status: 400 })
  }

  const { rows: clientRows } = await pool.query(
    `INSERT INTO clients (nombre) VALUES ($1)
     ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
     RETURNING id`,
    [cliente_nombre.trim()]
  )
  const clientId = clientRows[0].id

  const { rows } = await pool.query(
    `INSERT INTO tickets (client_id, assigned_to, tipo, poliza_ref, poliza_aseguradora, poliza_ramo, fuente, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'manual', 'pendiente')
     RETURNING id, ticket_number, tipo, status, poliza_ref, poliza_aseguradora, poliza_ramo, fuente, created_at, updated_at`,
    [clientId, assigned_to, tipo, poliza_ref, poliza_aseguradora, poliza_ramo]
  )

  return NextResponse.json(rows[0], { status: 201 })
}
