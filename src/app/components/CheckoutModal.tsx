'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';

function CheckoutForm({
  orderId,
  total,
  onSuccess,
  onClose,
}: {
  orderId: number;
  total: number;
  onSuccess: (orderId: number) => void;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    if (!stripe || !elements) {
      setErrorMessage('Stripe aún no está listo. Intenta de nuevo en unos segundos.');
      return;
    }

    setConfirming(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success?orderId=${orderId}`,
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message ?? 'Error al confirmar el pago');
      setConfirming(false);
      return;
    }

    onSuccess(orderId);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4 pb-6">
      <div className="rounded-2xl border border-[#E0DDD8] bg-white p-5 text-[#1A1A1A] shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Paga tu pedido</h3>
        <div className="stripe-element w-full min-w-0">
          <PaymentElement />
        </div>
      </div>

      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={!stripe || !elements || confirming}
          className="w-full rounded-2xl bg-[#1A1A1A] px-4 py-4 text-white font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {confirming ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Confirmando pago…
            </span>
          ) : (
            `Pagar ${total.toFixed(2)} €`
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl border border-[#E0DDD8] bg-white px-4 py-4 text-[#1A1A1A] font-semibold"
        >
          Volver
        </button>
      </div>
    </form>
  );
}

export function CheckoutModal({
  orderId,
  total,
  onSuccess,
  onClose,
}: {
  orderId: number;
  total: number;
  onSuccess: (orderId: number) => void;
  onClose: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const stripePromise = useMemo(() => getStripe(), []);

  useEffect(() => {
    async function fetchClientSecret() {
      setLoading(true);
      setFetchError(null);

      try {
        const response = await fetch('/api/stripe/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            amount: total,
            currency: 'eur',
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.clientSecret) {
          throw new Error(data.error ?? 'No se pudo crear el pago');
        }

        setClientSecret(data.clientSecret);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        setFetchError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchClientSecret();
  }, [orderId, total]);

  const paymentElementOptions = { layout: 'tabs' as const };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-4 sm:items-center">
      <div className="w-full max-w-[95vw] sm:max-w-md overflow-hidden rounded-3xl border border-[#E0DDD8] bg-[#FAFAF8] shadow-2xl">
        <div className="flex items-center justify-between px-5 py-5 bg-white border-b border-[#E0DDD8]">
          <div>
            <p className="text-[12px] uppercase tracking-[0.25em] text-[#9B9589]">Pago seguro</p>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Checkout</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#9B9589] hover:text-[#1A1A1A]"
            aria-label="Cerrar checkout"
          >
            ✕
          </button>
        </div>

        <div className="p-5 max-h-[85vh] overflow-y-auto">
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-[#9B9589]">
                <span className="w-10 h-10 border-4 border-[#1A1A1A]/20 border-t-[#1A1A1A] rounded-full animate-spin" />
                Cargando método de pago…
              </div>
            </div>
          ) : fetchError ? (
            <div className="rounded-2xl border border-[#E0DDD8] bg-white p-5 text-center text-[#9B9589]">
              <p className="mb-4">{fetchError}</p>
              <button
                onClick={onClose}
                className="rounded-2xl bg-[#1A1A1A] px-4 py-3 text-white font-semibold"
              >
                Cerrar
              </button>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' }, paymentElement: paymentElementOptions }}>
              <CheckoutForm orderId={orderId} total={total} onSuccess={onSuccess} onClose={onClose} />
            </Elements>
          ) : (
            <p className="text-center text-[#9B9589]">No se encontró información de pago.</p>
          )}
        </div>
      </div>
    </div>
  );
}
