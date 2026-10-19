-- =====================================================
-- Saku - Skema database (MySQL 8+, kompatibel Aiven)
-- Jalankan pada database yang sudah ada (mis. `defaultdb` di Aiven).
-- =====================================================
-- Pengguna (satu ruang keuangan pribadi per pengguna)
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name            VARCHAR(100) NOT NULL,
  account_label   VARCHAR(50)  NOT NULL DEFAULT 'Akun pribadi',
  opening_balance BIGINT       NOT NULL DEFAULT 0 COMMENT 'Saldo awal dalam Rupiah',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Kategori transaksi
-- type: pemasukan | pengeluaran | keduanya
CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(50)  NOT NULL,
  type       ENUM('pemasukan','pengeluaran','keduanya') NOT NULL DEFAULT 'keduanya',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB;

-- Transaksi
-- Kode tampilan (TRX-008) dibentuk dari id: CONCAT('TRX-', LPAD(id, 3, '0'))
-- Nominal selalu positif; jenis menentukan efek ke saldo.
CREATE TABLE IF NOT EXISTS transactions (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id          INT UNSIGNED NOT NULL,
  category_id      INT UNSIGNED NOT NULL,
  type             ENUM('pemasukan','pengeluaran') NOT NULL,
  amount           BIGINT UNSIGNED NOT NULL,
  transaction_date DATE         NOT NULL,
  description      VARCHAR(255) NOT NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tx_user_date (user_id, transaction_date, id),
  KEY idx_tx_user_type (user_id, type),
  KEY idx_tx_category (category_id),
  CONSTRAINT chk_tx_amount CHECK (amount > 0),
  CONSTRAINT fk_tx_user     FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  CONSTRAINT fk_tx_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================
-- Data awal (sesuai desain)
-- =====================================================
INSERT IGNORE INTO users (id, name, account_label, opening_balance)
VALUES (1, 'Andi Pratama', 'Akun pribadi', 0);

INSERT IGNORE INTO categories (id, name, type) VALUES
  (1, 'Gaji',           'pemasukan'),
  (2, 'Pekerjaan lepas','pemasukan'),
  (3, 'Belanja',        'pengeluaran'),
  (4, 'Transportasi',   'pengeluaran'),
  (5, 'Tagihan',        'pengeluaran'),
  (6, 'Tempat tinggal', 'pengeluaran'),
  (7, 'Lainnya',        'keduanya');
