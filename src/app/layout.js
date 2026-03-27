import './../styles/globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Machine Task Collector',
  description: 'Collect and search machine tasks from companies',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
