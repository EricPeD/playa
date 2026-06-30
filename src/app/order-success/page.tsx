import Link from 'next/link';

interface OrderSuccessPageProps {
  searchParams: {
    orderId?: string;
    payment_intent?: string;
    redirect_status?: string;
  };
}

export default function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const orderId = searchParams.orderId ?? null;
  const success = searchParams.redirect_status === 'succeeded';

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-[32px] border border-[#E0DDD8] bg-white p-8 shadow-[0_30px_80px_rgba(26,26,26,0.08)]">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-[#9B9589]">Confirmación de pedido</p>
          <h1 className="mt-4 text-4xl font-black text-[#1A1A1A]">¡Gracias por tu compra!</h1>
          <p className="mt-3 text-base text-[#9B9589] max-w-xl mx-auto">
            {success
              ? 'Hemos recibido tu pago y estamos preparando tu pedido. Pronto recibirá la confirmación de entrega.'
              : 'Tu pedido se ha registrado correctamente. Si necesitas revisar el pago, vuelve a la página principal.'}
          </p>
        </div>

        <div className="grid gap-4 rounded-3xl border border-[#E0DDD8] bg-[#FAFAF8] p-6 text-[#1A1A1A]">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[#9B9589]">Número de pedido</span>
            <span className="font-semibold">{orderId ?? 'Sin referencia'}</span>
          </div>

          {searchParams.payment_intent && (
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[#9B9589]">Pago Stripe</span>
              <span className="font-semibold break-all">{searchParams.payment_intent}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[#9B9589]">Estado de pago</span>
            <span className="font-semibold">{success ? 'Completado' : 'Pendiente'}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link href="/" className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1A1A1A] px-6 py-4 text-white transition hover:opacity-90 sm:w-auto">
            Volver al inicio
          </Link>
          <Link href="/" className="inline-flex w-full items-center justify-center rounded-2xl border border-[#E0DDD8] bg-white px-6 py-4 text-[#1A1A1A] transition hover:bg-[#FAFAF8] sm:w-auto">
            Ver más productos
          </Link>
        </div>
      </div>
    </main>
  );
}
