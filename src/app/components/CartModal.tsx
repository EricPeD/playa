import { IcoPhone, IcoBack, IcoCart, IcoPinOff, IcoPlus, IcoMinus, IcoCheck, IcoPin } from './icons';
import { CartItem, Product, CreateOrderPayload } from '@/lib/types';
import { useState, useEffect } from 'react';
import { COUNTRY_CODES } from '@/lib/country';
import { PhoneModal } from './PhoneModal';
import { submitOrder } from '@/lib/orders';

// ── CartModal ──────────────────────────────────────────────────────────────────
export function CartModal({
  gpsData,
  cart,
  onClose,
  gpsEnabled,
  gpsError,
  onRequestGps,
  onPlaceOrder,
  onAdd,
  onRemove,
}: {
  gpsData: { latitude: number; longitude: number } | null;
  cart: CartItem[];
  onClose: () => void;
  gpsEnabled: boolean;
  gpsError: string | null;
  onRequestGps: () => void;
  onPlaceOrder: (orderId: number) => void;
  onAdd: (p: Product) => void;
  onRemove: (id: number) => void;
}) {
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const [phone, setPhone]                 = useState('');
  const [country, setCountry]             = useState(COUNTRY_CODES[0]);
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [phoneModal, setPhoneModal]       = useState(false);
  const [notes, setNotes]                 = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState<string | null>(null);

  const canOrder = gpsEnabled && phoneConfirmed && !submitting;

  console.log(
    `[CartModal] Render — ${cart.length} items, total=${total.toFixed(2)}, gps=${gpsEnabled}, ` +
    `phone=${phoneConfirmed ? country.code + phone : 'none'}, gpsData=${gpsEnabled ? JSON.stringify(gpsData) : 'none'}`
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (phoneModal) { setPhoneModal(false); return; }
        console.log('[CartModal] Escape key');
        onClose();
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose, phoneModal]);

  // ── create order ─────────────────────────────────────────────────────────────
  async function handleCreateOrder() {
    if (!canOrder) {
      console.warn('[CartModal] Condiciones no cumplidas — abortando', { gpsEnabled, phoneConfirmed });
      return;
    }

    const payload: CreateOrderPayload = {
      cart,
      phone: phone || null,
      countryCode: country.code,
      gpsData,
      notes: notes.trim() || null,
      deliveryFee: 0,
    };

    console.log('[CartModal] 🛒 Enviando pedido…', payload);
    setSubmitting(true);
    setSubmitError(null);

    const result = await submitOrder(payload);

    setSubmitting(false);

    if (result.success && result.orderId) {
      console.log('[CartModal] ✅ Pedido creado con id:', result.orderId);
      onPlaceOrder(result.orderId);
    } else {
      console.error('[CartModal] ❌ Error al crear pedido:', result.error);
      setSubmitError(result.error ?? 'Error desconocido');
    }
  }

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-[#FAFAF8]">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-4 bg-white border-b border-[#F0EDE8]">
          <button
            onClick={() => { console.log('[CartModal] Cerrando'); onClose(); }}
            className="w-9 h-9 rounded-full bg-[#F5F2ED] flex items-center justify-center text-[#1A1A1A] active:scale-95 transition-transform"
            aria-label="Volver"
          >
            <IcoBack />
          </button>
          <div className="w-9 h-9 rounded-xl bg-[#F5F2ED] flex items-center justify-center text-[#1A1A1A]">
            <IcoCart size={18} />
          </div>
          <div>
            <p className="text-[10px] text-[#9B9589] uppercase tracking-widest">Tu pedido</p>
            <h2 className="text-[17px] font-bold text-[#1A1A1A]">Carrito</h2>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
              <div className="text-[#D0CCC5]"><IcoCart size={34} /></div>
              <p className="text-[15px] text-[#9B9589]">Tu carrito está vacío.</p>
            </div>
          ) : (
            <>
              <div className="mt-2">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3 py-3 border-b border-[#F0EDE8] last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#1A1A1A] leading-snug truncate">{product.name}</p>
                      <p className="text-[12px] text-[#9B9589] mt-0.5">
                        {Number(product.price).toFixed(2)} € × {quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { console.log(`[CartModal] - : ${product.name}`); onRemove(product.id); }}
                        className="w-8 h-8 rounded-full border border-[#E0DDD8] text-[#1A1A1A] flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <IcoMinus size={15} />
                      </button>
                      <span className="text-[14px] font-bold w-5 text-center tabular-nums">{quantity}</span>
                      <button
                        onClick={() => { console.log(`[CartModal] + : ${product.name}`); onAdd(product); }}
                        className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <IcoPlus size={15} />
                      </button>
                    </div>
                    <p className="text-[14px] font-bold text-[#1A1A1A] shrink-0 w-14 text-right tabular-nums">
                      {(product.price * quantity).toFixed(2)} €
                    </p>
                  </div>
                ))}

                {/* Total */}
                <div className="flex justify-between items-center py-4">
                  <p className="text-[14px] text-[#9B9589]">Total</p>
                  <p className="text-[24px] font-black text-[#1A1A1A] tabular-nums">{total.toFixed(2)} €</p>
                </div>
              </div>

              {/* ── Notes ── */}
              <div className="mb-3">
                <label className="block text-[12px] font-semibold text-[#9B9589] uppercase tracking-widest mb-1.5 px-1">
                  Notas <span className="font-normal normal-case tracking-normal">(opcional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Sin gluten, alergia a frutos secos, dejar en sombrilla azul…"
                  maxLength={280}
                  rows={3}
                  className="w-full rounded-2xl border border-[#E0DDD8] bg-white px-4 py-3 text-[14px] text-[#1A1A1A] placeholder:text-[#C0BDB8] outline-none focus:border-[#1A1A1A] transition-colors resize-none leading-snug"
                />
                {notes.length > 0 && (
                  <p className="text-[11px] text-[#C0BDB8] text-right mt-1 pr-1">
                    {notes.length}/280
                  </p>
                )}
              </div>

              {/* ── Phone card ── */}
              <button
                onClick={() => { console.log('[CartModal] Abrir modal teléfono'); setPhoneModal(true); }}
                className={`w-full rounded-2xl p-4 flex items-center gap-3 mb-3 text-left transition-all active:scale-[0.98] ${
                  phoneConfirmed
                    ? 'bg-[#F0FFF4] border border-[#BBF7D0]'
                    : 'bg-[#FFFBEB] border border-[#FDE68A]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  phoneConfirmed ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF9C3] text-[#D97706]'
                }`}>
                  <IcoPhone size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1A1A1A]">
                    {phoneConfirmed ? 'Teléfono añadido' : 'Añadir teléfono'}
                  </p>
                  <p className="text-[12px] text-[#9B9589] mt-0.5 leading-snug">
                    {phoneConfirmed
                      ? `${country.flag} ${country.code} ${phone}`
                      : 'Lo usará el repartidor si necesita contactar contigo.'}
                  </p>
                </div>
                {phoneConfirmed
                  ? <span className="text-[#16A34A] shrink-0"><IcoCheck size={18} /></span>
                  : <span className="text-[12px] font-bold text-[#D97706] shrink-0">Añadir</span>
                }
              </button>

              {/* ── GPS card ── */}
              <button
                onClick={() => {
                  console.log('[CartModal] GPS card pulsada. gpsEnabled:', gpsEnabled);
                  if (!gpsEnabled) onRequestGps();
                }}
                className={`w-full rounded-2xl p-4 flex items-center gap-3 mb-4 text-left transition-all active:scale-[0.98] ${
                  gpsEnabled
                    ? 'bg-[#F0FFF4] border border-[#BBF7D0]'
                    : 'bg-[#FFFBEB] border border-[#FDE68A]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  gpsEnabled ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF9C3] text-[#D97706]'
                }`}>
                  {gpsEnabled ? <IcoPin size={20} /> : <IcoPinOff size={20} />}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1A1A1A]">
                    {gpsEnabled ? 'Ubicación activa' : 'Activar ubicación'}
                  </p>
                  <p className="text-[12px] text-[#9B9589] mt-0.5 leading-snug">
                    {gpsEnabled
                      ? 'El repartidor te encuentra en la playa.'
                      : (gpsError ?? 'Necesaria para entregar en playa.')}
                  </p>
                </div>
                {gpsEnabled
                  ? <span className="text-[#16A34A] shrink-0"><IcoCheck size={18} /></span>
                  : <span className="text-[12px] font-bold text-[#D97706] shrink-0">Activar</span>
                }
              </button>
            </>
          )}
        </div>

        {/* CTA */}
        {cart.length > 0 && (
          <div className="px-4 pb-6 pt-3 bg-white border-t border-[#F0EDE8]">
            {submitError && (
              <p className="text-[12px] text-red-500 text-center mb-2">
                ⚠️ {submitError}
              </p>
            )}
            <button
              onClick={handleCreateOrder}
              disabled={!canOrder}
              className="w-full bg-[#1A1A1A] text-white rounded-2xl py-4 text-[15px] font-semibold disabled:opacity-35 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando pedido…
                </>
              ) : canOrder ? (
                `Confirmar pedido · ${total.toFixed(2)} €`
              ) : !phoneConfirmed ? (
                'Añade tu teléfono para continuar'
              ) : (
                'Activa la ubicación para pedir'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Phone modal */}
      {phoneModal && (
        <PhoneModal
          initialPhone={phone}
          initialCountry={country}
          onClose={() => {
            console.log('[PhoneModal] Cerrado sin guardar');
            setPhoneModal(false);
          }}
          onSave={(savedPhone, savedCountry) => {
            console.log(`[PhoneModal] Guardado: ${savedCountry.code} ${savedPhone}`);
            setPhone(savedPhone);
            setCountry(savedCountry);
            setPhoneConfirmed(true);
            setPhoneModal(false);
          }}
        />
      )}
    </>
  );
}