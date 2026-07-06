'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getStoredLanguage, getUiText, normalizeLanguage, type SupportedLanguage } from '@/lib/i18n';

const STATUS_STEPS = ['pending', 'preparing', 'delivering', 'delivered'] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: 'Recibido',
  preparing: 'Preparando',
  delivering: 'En reparto',
  delivered: 'Entregado',
};

function getStatusIndex(status: string) {
  return STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);
}

export default function TrackingPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [language, setLanguage] = useState<SupportedLanguage>('es');

  useEffect(() => {
    const stored = getStoredLanguage();
    setLanguage(normalizeLanguage(stored ?? 'es'));
  }, []);

  const t = useMemo(() => (key: string) => getUiText(language, key), [language]);

  async function loadTracking(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tracking?q=${encodeURIComponent(trimmed)}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? 'No se pudo encontrar el pedido');
      }
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!query) {
      setData(null);
      setError(null);
      return;
    }

    const timer = window.setTimeout(() => loadTracking(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!data?.order?.id) return;
    const interval = window.setInterval(() => loadTracking(String(data.order.id)), 30000);
    return () => window.clearInterval(interval);
  }, [data?.order?.id]);

  const statusIndex = data?.order?.status ? getStatusIndex(data.order.status) : -1;
  const totalItems = data?.items?.reduce((sum: number, item: any) => sum + (item.quantity ?? 0), 0) ?? 0;

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-4 py-6 text-[#1A1A1A]">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <div className="rounded-[28px] border border-[#E0DDD8] bg-white p-5 shadow-[0_24px_60px_rgba(26,26,26,0.06)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#9B9589]">Tracking</p>
          <h1 className="mt-2 text-2xl font-black">Consulta tu pedido</h1>
          <p className="mt-2 text-sm text-[#9B9589]">Introduce tu número de pedido o tu teléfono para ver el estado en tiempo real.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej. 42 o +34600111222"
              className="flex-1 rounded-2xl border border-[#E0DDD8] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A]"
            />
            <button
              onClick={() => loadTracking(query)}
              className="rounded-2xl bg-[#1A1A1A] px-4 py-3 text-sm font-semibold text-white"
            >
              {loading ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-[24px] border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
            {error}
          </div>
        )}

        {data?.order && (
          <div className="rounded-[28px] border border-[#E0DDD8] bg-white p-5 shadow-[0_24px_60px_rgba(26,26,26,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#9B9589]">Pedido</p>
                <h2 className="text-xl font-black">#{data.order.id}</h2>
              </div>
              <div className="rounded-full bg-[#F5F2ED] px-3 py-1 text-sm font-semibold text-[#1A1A1A]">
                {STATUS_LABELS[data.order.status] ?? data.order.status}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const done = idx <= statusIndex;
                return (
                  <div key={step} className="flex flex-col items-center gap-2 text-center">
                    <div className={`h-2.5 w-full rounded-full ${done ? 'bg-[#1A1A1A]' : 'bg-[#E0DDD8]'}`} />
                    <span className={`text-[11px] font-semibold ${done ? 'text-[#1A1A1A]' : 'text-[#9B9589]'}`}>
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 rounded-[24px] bg-[#FAFAF8] p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#9B9589]">Estado</span>
                <span className="font-semibold">{STATUS_LABELS[data.order.status] ?? data.order.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9B9589]">Artículos</span>
                <span className="font-semibold">{totalItems} productos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9B9589]">Total</span>
                <span className="font-semibold">{Number(data.order.total ?? 0).toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9B9589]">Playa</span>
                <span className="font-semibold">{data.order.beach_location ?? 'Sin ubicación'}</span>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#9B9589]">Resumen</p>
              <div className="mt-3 space-y-2">
                {data.items?.length ? data.items.map((item: any, idx: number) => (
                  <div key={`${item.name}-${idx}`} className="flex items-center justify-between rounded-2xl border border-[#F0EDE8] px-3 py-2 text-sm">
                    <span>{item.name}</span>
                    <span className="font-semibold">x{item.quantity}</span>
                  </div>
                )) : <p className="text-sm text-[#9B9589]">Sin artículos.</p>}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link href="/" className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#1A1A1A] px-4 py-3 text-sm font-semibold text-white">
                Volver al inicio
              </Link>
              <a href="https://wa.me/34600000000" className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#E0DDD8] bg-white px-4 py-3 text-sm font-semibold text-[#1A1A1A]">
                Contactar
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
