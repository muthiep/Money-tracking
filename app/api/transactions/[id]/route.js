import { pool, USER_ID } from '@/lib/db';
import { validateTransaction } from '@/lib/validate';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function find(id) {
  const [rows] = await pool.query(
    `SELECT t.id, CONCAT('TRX-', LPAD(t.id, 3, '0')) AS code, t.type, t.amount,
            t.transaction_date AS date, t.description, t.created_at AS createdAt,
            c.id AS categoryId, c.name AS category
     FROM transactions t JOIN categories c ON c.id = t.category_id
     WHERE t.id = ? AND t.user_id = ?`,
    [Number(id), USER_ID]
  );
  return rows[0];
}

async function balance() {
  const [[b]] = await pool.query(
    `SELECT u.opening_balance + COALESCE(SUM(CASE WHEN t.type='pemasukan' THEN t.amount ELSE -t.amount END),0) AS balance
     FROM users u LEFT JOIN transactions t ON t.user_id = u.id WHERE u.id = ?`,
    [USER_ID]
  );
  return b.balance;
}

export async function GET(_req, { params }) {
  const { id } = await params;
  const tx = await find(id);
  if (!tx) return NextResponse.json({ error: 'Transaksi tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ ...tx, balance: await balance() });
}

export async function PUT(req, { params }) {
  const { id } = await params;
  if (!(await find(id))) return NextResponse.json({ error: 'Transaksi tidak ditemukan.' }, { status: 404 });
  const v = await validateTransaction(await req.json().catch(() => ({})));
  if (!v.ok) return NextResponse.json({ errors: v.errors }, { status: 400 });
  const d = v.data;
  await pool.query(
    `UPDATE transactions SET category_id=?, type=?, amount=?, transaction_date=?, description=?
     WHERE id=? AND user_id=?`,
    [d.categoryId, d.type, d.amount, d.date, d.description, Number(id), USER_ID]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const [r] = await pool.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [Number(id), USER_ID]);
  if (!r.affectedRows) return NextResponse.json({ error: 'Transaksi tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
