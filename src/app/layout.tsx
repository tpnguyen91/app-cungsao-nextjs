import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FlowbiteProvider } from '@/components/providers/flowbite-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Quản lý Hộ Gia Đình',
  description: 'Hệ thống quản lý hộ gia đình và lịch cúng sao',
  icons: {
    icon: '/lotus-icon.svg',
    shortcut: '/lotus-icon.svg',
    apple: '/lotus-icon.svg'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='vi'>
      <body className={inter.variable}>
        <FlowbiteProvider>
          {children}
          <Toaster />
        </FlowbiteProvider>
      </body>
    </html>
  );
}
