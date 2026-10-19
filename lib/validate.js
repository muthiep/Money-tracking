import { pool } from './db';

export async function validateTransaction(body) {
  const errors = {};
  const type = body?.type;
  const amount = Number(body?.amount);
  const date = String(body?.date ?? '');
  const categoryId = Number(body?.categoryId);
  const description = String(body?.description ?? '').trim();

  if (!['pemasukan', 'pengeluaran'].includes(type)) errors.type = 'Pilih jenis transaksi.';
  if (!Number.isInteger(amount) || amount <= 0) errors.amount = 'Nominal harus lebih dari 0.';
  if (amount > 999999999999) errors.amount = 'Nominal terlalu besar.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) errors.date = 'Tanggal tidak valid.';
  if (!description) errors.description = 'Deskripsi wajib diisi.';
  else if (description.length > 255) errors.description = 'Deskripsi maksimal 255 karakter.';

  if (!errors.type) {
    const [rows] = await pool.query('SELECT type FROM categories WHERE id = ?', [categoryId]);
    if (!rows.length) errors.categoryId = 'Pilih kategori.';
    else if (rows[0].type !== 'keduanya' && rows[0].type !== type)
      errors.categoryId = 'Kategori tidak sesuai dengan jenis transaksi.';
  } else if (!categoryId) errors.categoryId = 'Pilih kategori.';

  return {
    errors,
    ok: Object.keys(errors).length === 0,
    data: { type, amount, date, categoryId, description },
  };
}
