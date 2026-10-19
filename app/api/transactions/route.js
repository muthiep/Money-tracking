import { pool, USER_ID } from "@/lib/db";
import { validateTransaction } from "@/lib/validate";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 10;

export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") || "").trim();
  const type = sp.get("type") || "";
  const category = Number(sp.get("category")) || 0;
  const month = /^\d{4}-\d{2}$/.test(sp.get("month") || "")
    ? sp.get("month")
    : "";
  const page = Math.max(1, Number(sp.get("page")) || 1);

  // Ringkasan: seluruh transaksi pada periode (tidak terpengaruh filter lain)
  const monthWhere = month
    ? "AND DATE_FORMAT(transaction_date, '%Y-%m') = ?"
    : "";
  const monthArgs = month ? [month] : [];
  const [[sum]] = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type='pemasukan'   THEN amount END),0) AS income,
       SUM(type='pemasukan')   AS incomeCount,
       COALESCE(SUM(CASE WHEN type='pengeluaran' THEN amount END),0) AS expense,
       SUM(type='pengeluaran') AS expenseCount
     FROM transactions WHERE user_id = ? ${monthWhere}`,
    [USER_ID, ...monthArgs],
  );

  const [[bal]] = await pool.query(
    `SELECT u.opening_balance + COALESCE(SUM(CASE WHEN t.type='pemasukan' THEN t.amount ELSE -t.amount END),0) AS balance
     FROM users u LEFT JOIN transactions t ON t.user_id = u.id WHERE u.id = ?`,
    [USER_ID],
  );

  // Daftar dengan filter
  const where = ["t.user_id = ?"];
  const args = [USER_ID];
  if (q) {
    where.push("t.description LIKE ?");
    args.push(`%${q}%`);
  }
  if (["pemasukan", "pengeluaran"].includes(type)) {
    where.push("t.type = ?");
    args.push(type);
  }
  if (category) {
    where.push("t.category_id = ?");
    args.push(category);
  }
  if (month) {
    where.push("DATE_FORMAT(t.transaction_date, '%Y-%m') = ?");
    args.push(month);
  }
  const W = where.join(" AND ");

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM transactions t WHERE ${W}`,
    args,
  );
  const [items] = await pool.query(
    `SELECT t.id, CONCAT('TRX-', LPAD(t.id, 3, '0')) AS code, t.type, t.amount,
            t.transaction_date AS date, t.description, c.id AS categoryId, c.name AS category
     FROM transactions t JOIN categories c ON c.id = t.category_id
     WHERE ${W}
     ORDER BY t.transaction_date DESC, t.id DESC
     LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
    args,
  );

  const [months] = await pool.query(
    `SELECT DISTINCT DATE_FORMAT(transaction_date, '%Y-%m') AS ym
     FROM transactions WHERE user_id = ? ORDER BY ym DESC`,
    [USER_ID],
  );

  return NextResponse.json({
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    summary: {
      ...sum,
      incomeCount: Number(sum.incomeCount || 0),
      expenseCount: Number(sum.expenseCount || 0),
    },
    balance: bal.balance,
    months: months.map((m) => m.ym),
  });
}

export async function POST(req) {
  const v = await validateTransaction(await req.json().catch(() => ({})));
  if (!v.ok) return NextResponse.json({ errors: v.errors }, { status: 400 });
  const d = v.data;
  const [r] = await pool.query(
    `INSERT INTO transactions (user_id, category_id, type, amount, transaction_date, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [USER_ID, d.categoryId, d.type, d.amount, d.date, d.description],
  );
  return NextResponse.json({ id: r.insertId }, { status: 201 });
}
