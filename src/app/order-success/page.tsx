'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, getStoredLanguage, getUiText, normalizeLanguage, type SupportedLanguage } from '@/lib/i18n';
import { clearCartStorage } from '@/lib/cart';
import { purchase } from '@/lib/metaPixel';
import { getOrderForPixel } from '@/lib/orders';

interface OrderSuccessPageProps {
  searchParams: {
    orderId?: string;
    payment_intent?: string;
    redirect_status?: string;
    lang?: string;
  };
}

export default function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const orderId = searchParams.orderId ?? null;
  const success = searchParams.redirect_status === 'succeeded';

  useEffect(() => {
    const fromUrl = normalizeLanguage(searchParams.lang);
    const fromStorage = getStoredLanguage();
    setLanguage(fromUrl === DEFAULT_LANGUAGE && !fromStorage ? fromUrl : (fromStorage ?? fromUrl));
    clearCartStorage();
  }, [searchParams.lang]);

  useEffect(() => {
    if (!success || !orderId) return;

    async function sendPurchase() {
      const order = await getOrderForPixel(Number(orderId));

      if (!order) return;

      purchase({
        orderId: String(order.id),
        value: Number(order.total),
        currency: 'EUR',
        items: order.order_items.map((i) => ({
          id: i.products.id,
          name: i.products.name,
          quantity: i.quantity,
          price: Number(i.unit_price),
        })),
      });
    }

    sendPurchase();
  }, [success, orderId]);

  const t = useMemo(() => (key: string) => getUiText(language, key), [language]);

  const trackingHref = orderId
    ? `/tracking?orderId=${encodeURIComponent(orderId)}&lang=${language}`
    : `/tracking?lang=${language}`;

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-[32px] border border-[#E0DDD8] bg-white p-8 shadow-[0_30px_80px_rgba(26,26,26,0.08)]">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-[#9B9589]">{t('successTitle')}</p>
          <h1 className="mt-4 text-4xl font-black text-[#1A1A1A]">{t('successSubtitle')}</h1>
          <p className="mt-3 text-base text-[#9B9589] max-w-xl mx-auto">
            {success ? t('successMessage') : t('successPending')}
          </p>
        </div>

        <div className="grid gap-4 rounded-3xl border border-[#E0DDD8] bg-[#FAFAF8] p-6 text-[#1A1A1A]">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[#9B9589]">{t('successOrderNumber')}</span>
            <span className="font-semibold">{orderId ?? 'Sin referencia'}</span>
          </div>

          {searchParams.payment_intent && (
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[#9B9589]">{t('successPayment')}</span>
              <span className="font-semibold break-all">{searchParams.payment_intent}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[#9B9589]">{t('successStatus')}</span>
            <span className="font-semibold">{success ? t('successCompleted') : t('successPendingStatus')}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={trackingHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A1A1A] px-6 py-4 text-white transition hover:opacity-90"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path
                d="M10 3.5C6 3.5 3 10 3 10C3 10 6 16.5 10 16.5C14 16.5 17 10 17 10C17 10 14 3.5 10 3.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {t('successTrackButton')}
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-[#E0DDD8] bg-white px-6 py-4 text-[#1A1A1A] transition hover:bg-[#FAFAF8] sm:w-auto"
            >
              {t('successBack')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}