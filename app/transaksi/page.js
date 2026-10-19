'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown, ArrowDownLeft, ArrowUpRight, Calendar, ChevronDown, Eye, Info, Pencil, Plus, Search, Trash2, Wallet,
} from 'lucide-react';
import Topbar from '@/components/Topbar';
import DeleteModal from '@/components/DeleteModal';
import { rupiah, fmtDate, monthLabel, monthRange, today } from '@/lib/format';

const Select = ({ value, onChange, children, icon }) => (
  <div className="select">
    <select value={value} onChange={(e) => onChange(e.target.value)} style={icon ? { paddingLeft: 38 } : undefined}>{children}</select>
    {icon && <Calendar size={15} style={{ left: 14, right: 'auto', color: 'var(--muted)' }} />}
    <ChevronDown size={15} />
  </div>
);

export default function TransaksiPage() {
  const [f, setF] = useState({ q: '', type: '', category: '', month: today().slice(0, 7) });
  const [qInput, setQInput] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [cats, setCats] = useState([]);
  const [del, setDel] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => { fetch('/api/categories').then((r) => r.json()).then(setCats); }, []);
  useEffect(() => {
    const t = setTimeout(() => { setF((x) => ({ ...x, q: qInput })); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    const ctrl = new AbortController();
    const p = new URLSearchParams({ ...f, page });
    fetch(`/api/transactions?${p}`, { signal: ctrl.signal }).then((r) => r.json()).then(setData).catch(() => {});
    return () => ctrl.abort();
  }, [f, page, tick]);

  const change = (k) => (v) => { setF((x) => ({ ...x, [k]: v })); setPage(1); };
  const remove = useCallback(async () => {
    await fetch(`/api/transactions/${del.id}`, { method: 'DELETE' });
    setDel(null);
    setTick((t) => t + 1);
  }, [del]);

  const months = data ? Array.from(new Set([f.month, ...data.months].filter(Boolean))).sort().reverse() : [f.month];
  const s = data?.summary;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const from = data && data.total ? (page - 1) * data.pageSize + 1 : 0;
  const to = data ? Math.min(page * data.pageSize, data.total) : 0;

  return (
    <>
      <Topbar crumbs={[{ label: 'Transaksi' }]} />
      <main className="content">
        <div className="head-row">
          <div>
            <h1 className="title">Transaksi</h1>
            <p className="subtitle">Kelola catatan keuanganmu, satu transaksi setiap waktu.</p>
          </div>
          <Link href="/transaksi/baru" className="btn primary"><Plus size={16} /> Tambah transaksi</Link>
        </div>

        <div className="range-row">
          <span>Ringkasan {f.month ? monthLabel(f.month) : 'semua periode'}</span>
          <span>{f.month ? monthRange(f.month) : ''}</span>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="top"><span>Total pemasukan</span><ArrowDownLeft size={16} /></div>
            <div className="val">{rupiah(s?.income)}</div>
            <div className="note">Dari {s?.incomeCount ?? 0} transaksi pemasukan</div>
          </div>
          <div className="stat">
            <div className="top"><span>Total pengeluaran</span><ArrowUpRight size={16} /></div>
            <div className="val">{rupiah(s?.expense)}</div>
            <div className="note">Dari {s?.expenseCount ?? 0} transaksi pengeluaran</div>
          </div>
          <div className="stat deep">
            <div className="top"><span>Saldo saat ini</span><Wallet size={16} /></div>
            <div className="val">{data && data.balance < 0 ? '−' : ''}{rupiah(data?.balance)}</div>
            <div className="note">Pemasukan dikurangi pengeluaran</div>
          </div>
        </div>

        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Semua transaksi <span className="chip">{data?.total ?? 0} transaksi</span></h2>
            <div className="filters">
              <label className="search">
                <Search size={16} />
                <input placeholder="Cari deskripsi transaksi…" value={qInput} onChange={(e) => setQInput(e.target.value)} />
              </label>
              <Select value={f.type} onChange={change('type')}>
                <option value="">Semua jenis</option>
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </Select>
              <Select value={f.category} onChange={change('category')}>
                <option value="">Semua kategori</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select value={f.month} onChange={change('month')} icon>
                <option value="">Semua periode</option>
                {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
              </Select>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 150 }}>Tanggal <ArrowDown size={12} style={{ verticalAlign: -1 }} /></th>
                  <th>Deskripsi</th>
                  <th style={{ width: 160 }}>Kategori</th>
                  <th style={{ width: 150 }}>Jenis</th>
                  <th className="r" style={{ width: 150 }}>Nominal</th>
                  <th style={{ width: 130 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((t) => {
                  const inc = t.type === 'pemasukan';
                  return (
                    <tr key={t.id}>
                      <td className="muted">{fmtDate(t.date, true)}</td>
                      <td className="desc"><b>{t.description}</b><small>{t.code}</small></td>
                      <td className="muted">{t.category}</td>
                      <td>
                        <span className={`badge ${inc ? 'in' : 'out'}`}>
                          {inc ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />} {inc ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td className={`r amt ${inc ? 'in' : ''}`}>{inc ? '+ ' : '− '}{rupiah(t.amount)}</td>
                      <td>
                        <div className="actions">
                          <Link href={`/transaksi/${t.id}`} aria-label="Lihat detail"><Eye size={16} /></Link>
                          <Link href={`/transaksi/${t.id}/edit`} aria-label="Edit"><Pencil size={16} /></Link>
                          <button className="del" aria-label="Hapus" onClick={() => setDel(t)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data && !data.items.length && (
            <div className="empty">
              <b>Belum ada transaksi</b>
              Ubah filter atau tambahkan transaksi pertamamu.
            </div>
          )}

          <div className="pager">
            <span>Menampilkan {from}–{to} dari {data?.total ?? 0} transaksi</span>
            <div className="pager-nav">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</button>
              <span className="pg">{page}</span>
              <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Berikutnya</button>
            </div>
          </div>
        </section>

        <p className="foot-note"><Info size={14} /> Saldo awal Rp0. Ringkasan dihitung dari seluruh transaksi pada periode ini.</p>
      </main>

      {del && <DeleteModal tx={del} balance={data?.balance ?? 0} onClose={() => setDel(null)} onConfirm={remove} />}
    </>
  );
}
