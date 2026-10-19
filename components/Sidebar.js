import Link from 'next/link';
import { ArrowLeftRight, Wallet, Sprout } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark"><Wallet size={18} /></span> piento
      </div>
      <div className="nav-label">KEUANGAN PRIBADI</div>
      <Link href="/transaksi" className="nav-item active">
        <ArrowLeftRight size={18} /> Transaksi <span className="dot" />
      </Link>

      <div className="side-tip">
        <Sprout size={20} />
        <strong>Langkah kecil, lebih teratur.</strong>
        <p>Catat setiap transaksi untuk mengenal kebiasaan keuanganmu.</p>
      </div>
      <div className="side-user">
        <span className="avatar">AP</span>
        <div><b>Andi Pratama</b><small>Akun pribadi</small></div>
      </div>
    </aside>
  );
}
