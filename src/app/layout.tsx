import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Playa Delivery',
  description: 'Delivery en la playa con pedidos rápidos y seguimiento simple.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
