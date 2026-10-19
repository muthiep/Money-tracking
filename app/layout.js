import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Piento – Keuangan pribadi',
  description: 'Catat pemasukan dan pengeluaranmu dengan teratur.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        <Sidebar />
        <div className="main">{children}</div>
      </body>
    </html>
  );
}
