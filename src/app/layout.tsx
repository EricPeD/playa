import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import MetaPixel from '@/app/components/MetaPixel';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Playa Delivery',
  description: 'Delivery en la playa con pedidos rápidos y seguimiento simple.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}