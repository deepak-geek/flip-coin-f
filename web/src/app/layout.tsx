import { Header } from '@/components/header/header';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import HowToPlay from './_components/HowToPlay';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Flip Coin',
  description: '',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.variable,
      )}
    >
      <head>
        <link
          rel='icon'
          type='image/svg+xml'
          href='/assets/favicon/favicon.svg'
        />
        <link rel='icon' type='image/png' href='/assets/favicon/favicon.png' />
      </head>
      <body>
        <Header />
        <main className='p-4 xl:p-12 2xl:px-24'>{children}</main>
        <HowToPlay />
        <Analytics />
      </body>
    </html>
  );
}
