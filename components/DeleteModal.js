'use client';
import { useEffect, useState } from 'react';
import { Trash2, X, Info } from 'lucide-react';
import { rupiah, fmtDateLong } from '@/lib/format';

export default function DeleteModal({ tx, balance, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const income = tx.type === 'pemasukan';
  const after = income ? balance - tx.amount : balance + tx.amount;

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [busy, onClose]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="del-title">
        <button className="x" onClick={onClose} aria-label="Tutup"><X size={18} /></button>
        <div className="ico"><Trash2 size={20} /></div>
        <h2 id="del-title">Hapus transaksi ini?</h2>
        <p>Transaksi akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
        <div className="sum">
          <div><span>{tx.description}</span><span>{rupiah(tx.amount)}</span></div>
          <small>{fmtDateLong(tx.date)} · {tx.category} · {tx.code}</small>
        </div>
        <div className="effect">
          <Info size={16} />
          <span>
            {income ? 'Pemasukan' : 'Pengeluaran'} berkurang {rupiah(tx.amount)} dan saldo akan menjadi{' '}
            {after < 0 ? '−' : ''}{rupiah(after)}.
          </span>
        </div>
        <div className="foot">
          <button className="btn" onClick={onClose} disabled={busy}>Batal</button>
          <button
            className="btn danger"
            disabled={busy}
            onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); }}
          >
            {busy ? 'Menghapus…' : 'Ya, hapus transaksi'}
          </button>
        </div>
      </div>
    </div>
  );
}
