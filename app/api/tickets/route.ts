import { NextResponse } from 'next/server'
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
      t.fuente,
      t.ref_ticket_id,
      t.created_at,
      t.updated_at,
      c.nombre AS cliente_nombre,
      p.name   AS productor_nombre,
      p.id     AS productor_id,
      rt.ticket_number AS ref_ticket_number,
      EXTRACT(EPOCH FROM (NOW() - t.updated_at))/3600 AS horas_sin_mover
    FROM tickets t
    LEFT JOIN clients  c  ON t.client_id  = c.id
    LEFT JOIN producers p ON t.assigned_to = p.id
    LEFT JOIN tickets  rt ON t.ref_ticket_id = rt.id
    WHERE t.status != 'cerrado'
       OR t.closed_at > NOW() - INTERVAL '24 hours'
    ORDER BY
      CASE t.status
        WHEN 'a_confirmar' THEN 1
        WHEN 'pendiente'   THEN 2
        WHEN 'en_proceso'  THEN 3
        WHEN 'cerrado'     THEN 4
      END,
      t.updated_at ASC
  `)
  return NextResponse.json(rows)
}
