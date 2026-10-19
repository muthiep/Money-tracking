import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [rows] = await pool.query('SELECT id, name, type FROM categories ORDER BY name');
  return NextResponse.json(rows);
}
