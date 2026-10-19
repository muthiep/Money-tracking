import Link from 'next/link';
import { ChevronRight, Lock } from 'lucide-react';

export default function Topbar({ crumbs }) {
  return (
    <header className="topbar">
      <nav className="crumbs" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: 'contents' }}>
            {i > 0 && <ChevronRight size={14} />}
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span className="cur">{c.label}</span>}
          </span>
        ))}
      </nav>
      <div className="private"><Lock size={14} /> Ruang keuangan pribadi</div>
    </header>
  );
}
