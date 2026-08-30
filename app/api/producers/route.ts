import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  const { rows } = await pool.query(
    `SELECT id, name FROM producers WHERE active = true ORDER BY name`
  )
  return NextResponse.json(rows)
}
