-- Transaksi contoh (opsional). Jalankan SEKALI setelah schema.sql.
INSERT INTO transactions (user_id, category_id, type, amount, transaction_date, description, created_at) VALUES
  (1, 1, 'pemasukan',   8000000, '2026-10-01', 'Gaji Oktober',          '2026-10-01 08:00:00'),
  (1, 5, 'pengeluaran',  100000, '2026-10-05', 'Paket internet',        '2026-10-05 10:12:00'),
  (1, 7, 'pemasukan',    250000, '2026-10-08', 'Pengembalian belanja',  '2026-10-08 13:20:00'),
  (1, 6, 'pengeluaran', 1200000, '2026-10-10', 'Sewa kos Oktober',      '2026-10-10 09:05:00'),
  (1, 5, 'pengeluaran',  275000, '2026-10-15', 'Tagihan listrik',       '2026-10-15 19:30:00'),
  (1, 4, 'pengeluaran',  125000, '2026-10-16', 'Transportasi mingguan', '2026-10-16 07:45:00'),
  (1, 2, 'pemasukan',   1500000, '2026-10-17', 'Proyek desain lepas',   '2026-10-17 16:10:00'),
  (1, 3, 'pengeluaran',  350000, '2026-10-18', 'Belanja bulanan',       '2026-10-18 09:41:00');
