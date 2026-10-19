const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const LONG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export const rupiah = (n) => 'Rp' + Math.abs(Number(n) || 0).toLocaleString('id-ID');

export function fmtDate(str, short = false) {
  const [y, m, d] = String(str).slice(0, 10).split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${(short ? SHORT : LONG)[m - 1]} ${y}`;
}

export const fmtDateLong = (str) => {
  const [y, m, d] = String(str).slice(0, 10).split('-').map(Number);
  return `${d} ${LONG[m - 1]} ${y}`;
};

export function fmtDateTime(str) {
  const s = String(str);
  return `${fmtDateLong(s)}, ${s.slice(11, 16).replace(':', '.')}`;
}

export function monthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  return `${LONG[m - 1]} ${y}`;
}

export function monthRange(ym) {
  const [y, m] = ym.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return `01–${last} ${LONG[m - 1]} ${y}`;
}

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
