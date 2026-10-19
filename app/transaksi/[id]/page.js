'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, Clock, Pencil, Trash2, Wallet } from 'lucide-react';
import Topbar from '@/components/Topbar';
import DeleteModal from '@/components/DeleteModal';
import { rupiah, fmtDateLong, fmtDateTime, monthLabel } from '@/lib/format';

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tx, setTx] = useState(null);
  const [missing, setMissing] = useState(false);
  const [del, setDel] = useState(false);

  useEffect(() => {
    fetch(`/api/transactions/${id}`).then(async (r) => (r.ok ? setTx(await r.json()) : setMissing(true)));
  }, [id]);

  async function remove() {
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    router.push('/transaksi');
    router.refresh();
  }

  const inc = tx?.type === 'pemasukan';

  return (
    <>
      <Topbar crumbs={[{ label: 'Transaksi', href: '/transaksi' }, { label: 'Detail transaksi' }]} />
      <main className="content">
        <Link href="/transaksi" className="back">← Kembali ke transaksi</Link>
        <h1 className="title">Detail transaksi</h1>
        <p className="subtitle">Lihat informasi lengkap dari transaksi yang kamu catat.</p>

        {missing && (
          <div className="card" style={{ marginTop: 28 }}>
            <div className="empty"><b>Transaksi tidak ditemukan</b>Transaksi ini mungkin sudah dihapus.</div>
          </div>
        )}

        {tx && (
          <div className="cols">
            <div className="card">
              <div className="detail-top">
                <div><h2>{tx.description}</h2><small>{tx.code}</small></div>
                <span className={`badge ${inc ? 'in' : 'out'}`}>
                  {inc ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />} {inc ? 'Pemasukan' : 'Pengeluaran'}
                </span>
              </div>
              <div className="detail-amount">
                <small>Nominal transaksi</small>
                <div className={`big ${inc ? 'in' : ''}`}>{inc ? '+ ' : '− '}{rupiah(tx.amount)}</div>
                <small>{inc ? 'Menambah saldo kamu' : 'Mengurangi saldo kamu'}</small>
              </div>
              <div className="meta">
                <div className="grid2">
                  <div><small>Tanggal</small><b>{fmtDateLong(tx.date)}</b></div>
                  <div><small>Kategori</small><b>{tx.category}</b></div>
                </div>
                <div style={{ marginBottom: 26 }}><small>Deskripsi</small><b>{tx.description}</b></div>
                <div className="recorded"><Clock size={14} /> Dicatat pada {fmtDateTime(tx.createdAt)}</div>
              </div>
              <div className="card-foot between">
                <button className="btn" onClick={() => setDel(true)}><Trash2 size={15} /> Hapus transaksi</button>
                <Link href={`/transaksi/${id}/edit`} className="btn primary"><Pencil size={15} /> Edit transaksi</Link>
              </div>
            </div>

            <aside className="note-card">
              <Wallet size={22} />
              <h3>Catatan yang berarti</h3>
              <p>Transaksi ini sudah masuk dalam total {inc ? 'pemasukan' : 'pengeluaran'} {monthLabel(tx.date.slice(0, 7))}.</p>
              <hr />
              <small>Saldo saat ini</small>
              <div className="bal">{tx.balance < 0 ? '−' : ''}{rupiah(tx.balance)}</div>
            </aside>
          </div>
        )}
      </main>
      {del && tx && <DeleteModal tx={tx} balance={tx.balance} onClose={() => setDel(false)} onConfirm={remove} />}
    </>
  );
}
