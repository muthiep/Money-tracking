'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDownLeft, ArrowUpRight, Calendar, Check, ChevronDown, Circle, CircleDot, Info } from 'lucide-react';
import Topbar from './Topbar';
import { today } from '@/lib/format';

export default function TransactionForm({ mode, id, code }) {
  const router = useRouter();
  const edit = mode === 'edit';
  const backHref = edit ? `/transaksi/${id}` : '/transaksi';

  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(edit);
  const [form, setForm] = useState({ type: 'pengeluaran', amount: '', date: today(), categoryId: '', description: '' });
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetch('/api/categories').then((r) => r.json()).then(setCats); }, []);

  useEffect(() => {
    if (!edit) return;
    fetch(`/api/transactions/${id}`).then((r) => r.json()).then((t) => {
      setForm({ type: t.type, amount: String(t.amount), date: t.date, categoryId: String(t.categoryId), description: t.description });
      setTitle(t.description);
      setLoading(false);
    });
  }, [edit, id]);

  const options = useMemo(() => cats.filter((c) => c.type === 'keduanya' || c.type === form.type), [cats, form.type]);
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  function setType(type) {
    setForm((f) => {
      const cur = cats.find((c) => String(c.id) === f.categoryId);
      const ok = cur && (cur.type === 'keduanya' || cur.type === type);
      return { ...f, type, categoryId: ok ? f.categoryId : '' };
    });
  }

  async function submit() {
    setBusy(true);
    const res = await fetch(edit ? `/api/transactions/${id}` : '/api/transactions', {
      method: edit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: Number(form.amount), categoryId: Number(form.categoryId) }),
    });
    if (res.ok) { router.push(backHref); router.refresh(); return; }
    const j = await res.json().catch(() => ({}));
    setErrors(j.errors || { description: j.error || 'Terjadi kesalahan. Coba lagi.' });
    setBusy(false);
  }

  const Seg = ({ value, label, Icon }) => {
    const on = form.type === value;
    return (
      <button type="button" className={on ? 'on' : ''} onClick={() => setType(value)} aria-pressed={on}>
        <Icon size={15} /> <span>{label}</span> {on ? <CircleDot size={18} /> : <Circle size={18} />}
      </button>
    );
  };

  return (
    <>
      <Topbar crumbs={[{ label: 'Transaksi', href: '/transaksi' }, { label: edit ? 'Edit transaksi' : 'Tambah transaksi' }]} />
      <main className="content">
        <a href={backHref} onClick={(e) => { e.preventDefault(); router.push(backHref); }} className="back">
          ← {edit ? 'Kembali ke detail transaksi' : 'Kembali ke transaksi'}
        </a>
        <h1 className="title">{edit ? 'Edit transaksi' : 'Tambah transaksi'}</h1>
        <p className="subtitle">
          {edit ? `Perbarui catatan ${title} · ${code ?? `TRX-${String(id).padStart(3, '0')}`}` : 'Mulai dari catatan kecil untuk keuangan yang lebih teratur.'}
        </p>

        <div className="cols">
          <div className="card">
            <div className="card-head">
              <h2>Informasi transaksi</h2>
              <p>Lengkapi semua isian di bawah ini.</p>
            </div>
            <div className="card-body" aria-busy={loading}>
              <div className="field">
                <span className="label">Jenis transaksi</span>
                <div className="seg">
                  <Seg value="pemasukan" label="Pemasukan" Icon={ArrowDownLeft} />
                  <Seg value="pengeluaran" label="Pengeluaran" Icon={ArrowUpRight} />
                </div>
                {errors.type && <div className="err-text">{errors.type}</div>}
              </div>

              <div className="field">
                <label htmlFor="amount">Nominal</label>
                <div className={`rp ${errors.amount ? 'err' : ''}`}>
                  <span>Rp</span>
                  <input
                    id="amount" inputMode="numeric" placeholder="0"
                    value={form.amount ? Number(form.amount).toLocaleString('id-ID') : ''}
                    onChange={(e) => set('amount', e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 12))}
                  />
                </div>
                {errors.amount && <div className="err-text">{errors.amount}</div>}
              </div>

              <div className="grid2">
                <div className="field">
                  <label htmlFor="date">Tanggal</label>
                  <input id="date" type="date" className={`input ${errors.date ? 'err' : ''}`} value={form.date} onChange={(e) => set('date', e.target.value)} />
                  {errors.date && <div className="err-text">{errors.date}</div>}
                </div>
                <div className="field">
                  <label htmlFor="cat">Kategori</label>
                  <div className="select full">
                    <select id="cat" className={errors.categoryId ? 'err' : ''} value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}
                      style={{ color: form.categoryId ? undefined : 'var(--muted)' }}>
                      <option value="">Pilih kategori</option>
                      {options.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={16} />
                  </div>
                  {errors.categoryId && <div className="err-text">{errors.categoryId}</div>}
                </div>
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="desc">Deskripsi</label>
                <textarea id="desc" className={`input ${errors.description ? 'err' : ''}`} maxLength={255}
                  placeholder="Contoh: Belanja kebutuhan bulanan" value={form.description}
                  onChange={(e) => set('description', e.target.value)} />
                {errors.description
                  ? <div className="err-text">{errors.description}</div>
                  : <div className="hint">Gunakan deskripsi singkat agar transaksi mudah ditemukan.</div>}
              </div>
            </div>
            <div className="card-foot end">
              <button className="btn" onClick={() => router.push(backHref)} disabled={busy}>Batal</button>
              <button className="btn primary" onClick={submit} disabled={busy || loading}>
                <Check size={16} /> {busy ? 'Menyimpan…' : edit ? 'Simpan perubahan' : 'Simpan transaksi'}
              </button>
            </div>
          </div>

          <aside className="aside">
            <h3><Info size={16} /> Catat dengan tepat</h3>
            <h4>Nominal selalu positif</h4>
            <p>Masukkan angka tanpa tanda minus. Jenis transaksi menentukan perubahan saldo.</p>
            <h4>Pilih kategori yang sesuai</h4>
            <p>Kelompokkan transaksi agar pemasukan dan pengeluaran lebih mudah ditelusuri.</p>
            <div className="tipbox">
              {edit ? 'Perubahan akan memperbarui transaksi dan saldo secara otomatis.' : 'Saldo akan diperbarui setelah transaksi disimpan.'}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
