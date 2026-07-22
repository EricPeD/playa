import { initiateCheckout } from '@/lib/metaPixel';
import { IcoPhone, IcoBack, IcoCart, IcoPinOff, IcoPlus, IcoMinus, IcoCheck, IcoPin, IcoTruck } from './Icons';
import { CartItem, Product, CreateOrderPayload } from '@/lib/types';
import { useState, useEffect } from 'react';
import { COUNTRY_CODES } from '@/lib/country';
import { PhoneModal } from './PhoneModal';
import { CheckoutModal } from './CheckoutModal';
import { submitOrder } from '@/lib/orders';
import { getUiText, type SupportedLanguage } from '@/lib/i18n';
import { clearCartStorage } from '@/lib/cart';

const FREE_SHIPPING_THRESHOLD = 8;
const SHIPPING_COST = 2.20;

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
  language,
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
  language: SupportedLanguage;
}) {
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = qualifiesForFreeShipping ? 0 : SHIPPING_COST;
  const total = subtotal + shippingFee;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgressPct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const t = (key: string) => getUiText(language, key);

  const [phone, setPhone]                 = useState('');
  const [country, setCountry]             = useState(COUNTRY_CODES[0]);
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [phoneModal, setPhoneModal]       = useState(false);
  const [notes, setNotes]                 = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState<string | null>(null);
  const [showCheckout, setShowCheckout]   = useState(false);
  const [checkoutOrderId, setCheckoutOrderId] = useState<number | null>(null);

  const canOrder = gpsEnabled && phoneConfirmed && !submitting;

  console.log(
    `[CartModal] Render — ${cart.length} items, subtotal=${subtotal.toFixed(2)}, shipping=${shippingFee.toFixed(2)}, ` +
    `total=${total.toFixed(2)}, gps=${gpsEnabled}, phone=${phoneConfirmed ? country.code + phone : 'none'}, gpsData=${gpsEnabled ? JSON.stringify(gpsData) : 'none'}`
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
    console.warn('[CartModal] Condiciones no cumplidas — abortando', {
      gpsEnabled,
      phoneConfirmed,
    });
    return;
  }

  const payload: CreateOrderPayload = {
    cart,
    phone: phone || null,
    countryCode: country.code,
    gpsData,
    notes: notes.trim() || null,
    deliveryFee: shippingFee,
  };

  console.log('[CartModal] 🛒 Enviando pedido…', payload);
    setSubmitting(true);
    setSubmitError(null);

    const result = await submitOrder(payload);

    setSubmitting(false);

    if (result.success && result.orderId) {

      initiateCheckout({
        value: total,
        currency: "EUR",
        items: cart.map(item => ({
          id: String(item.product.id),
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });

      console.log('[CartModal] ✅ Pedido creado con id:', result.orderId);

      setCheckoutOrderId(result.orderId);
      setShowCheckout(true);

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
            <p className="text-[10px] text-[#9B9589] uppercase tracking-widest">{t('cartModalHeaderTitle')}</p>
            <h2 className="text-[17px] font-bold text-[#1A1A1A]">{t('cartModalHeaderSubtitle')}</h2>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
              <div className="text-[#D0CCC5]"><IcoCart size={34} /></div>
              <p className="text-[15px] text-[#9B9589]">{t('cartModalEmpty')}</p>
            </div>
          ) : (
            <>
              {/* ── Free shipping banner ── */}
              <div className={`mt-3 mb-1 rounded-2xl p-3.5 border transition-colors ${
                qualifiesForFreeShipping
                  ? 'bg-[#F0FFF4] border-[#BBF7D0]'
                  : 'bg-[#F5F2ED] border-[#E8E4DC]'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    qualifiesForFreeShipping ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-white text-[#9B9589]'
                  }`}>
                    {qualifiesForFreeShipping ? <IcoCheck size={16} /> : <IcoTruck size={16} />}
                  </div>
                  <p className={`text-[12.5px] font-semibold leading-snug ${
                    qualifiesForFreeShipping ? 'text-[#16A34A]' : 'text-[#1A1A1A]'
                  }`}>
                    {qualifiesForFreeShipping
                      ? t('cartModalFreeShippingUnlocked')
                      : t('cartModalFreeShippingProgress').replace('{amount}', remainingForFreeShipping.toFixed(2))}
                  </p>
                </div>
                <div className="mt-2.5 h-1.5 rounded-full bg-white/70 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      qualifiesForFreeShipping ? 'bg-[#16A34A]' : 'bg-[#1A1A1A]'
                    }`}
                    style={{ width: `${freeShippingProgressPct}%` }}
                  />
                </div>
              </div>

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

                {/* Subtotal / Shipping / Total */}
                <div className="py-3 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <p className="text-[13px] text-[#9B9589]">{t('cartModalSubtotalLabel')}</p>
                    <p className="text-[13px] font-semibold text-[#1A1A1A] tabular-nums">{subtotal.toFixed(2)} €</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[13px] text-[#9B9589]">{t('cartModalShippingLabel')}</p>
                    {qualifiesForFreeShipping ? (
                      <p className="text-[13px] font-semibold text-[#16A34A]">{t('cartModalShippingFree')}</p>
                    ) : (
                      <p className="text-[13px] font-semibold text-[#1A1A1A] tabular-nums">{shippingFee.toFixed(2)} €</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-1.5">
                    <p className="text-[14px] text-[#9B9589]">{t('cartModalTotal')}</p>
                    <p className="text-[24px] font-black text-[#1A1A1A] tabular-nums">{total.toFixed(2)} €</p>
                  </div>
                </div>
              </div>

              {/* ── Notes ── */}
              <div className="mb-3">
                <label className="block text-[12px] font-semibold text-[#9B9589] uppercase tracking-widest mb-1.5 px-1">
                  {t('cartModalNotesLabel')} <span className="font-normal normal-case tracking-normal">({t('cartModalNotesLabel').toLowerCase() === 'notas' ? 'opcional' : 'optional'})</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t('cartModalNotesPlaceholder')}
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
                    {phoneConfirmed ? t('cartModalPhoneTitleAdded') : t('cartModalPhoneTitleDefault')}
                  </p>
                  <p className="text-[12px] text-[#9B9589] mt-0.5 leading-snug">
                    {phoneConfirmed
                      ? `${country.flag} ${country.code} ${phone}`
                      : t('cartModalPhoneSubtitleDefault')}
                  </p>
                </div>
                {phoneConfirmed
                  ? <span className="text-[#16A34A] shrink-0"><IcoCheck size={18} /></span>
                  : <span className="text-[12px] font-bold text-[#D97706] shrink-0">{t('cartModalPhoneButtonDefault')}</span>
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
                    {gpsEnabled ? t('cartModalGpsTitleAdded') : t('cartModalGpsTitleDefault')}
                  </p>
                  <p className="text-[12px] text-[#9B9589] mt-0.5 leading-snug">
                    {gpsEnabled
                      ? t('cartModalGpsSubtitleAdded')
                      : (gpsError ?? t('cartModalGpsSubtitleDefault'))}
                  </p>
                </div>
                {gpsEnabled
                  ? <span className="text-[#16A34A] shrink-0"><IcoCheck size={18} /></span>
                  : <span className="text-[12px] font-bold text-[#D97706] shrink-0">{t('cartModalGpsButtonDefault')}</span>
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
                  {t('cartModalSubmitting')}
                </>
              ) : canOrder ? (
                `${t('cartModalSubmitPending')} ${total.toFixed(2)} €`
              ) : !phoneConfirmed ? (
                t('cartModalSubmitPhoneMissing')
              ) : (
                t('cartModalSubmitGpsMissing')
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
          language={language}
        />
      )}

      {showCheckout && checkoutOrderId !== null && (
        <CheckoutModal
          orderId={checkoutOrderId}
          total={total}
          onSuccess={(orderId) => {
            console.log('[CartModal] Pago completado para orderId:', orderId);
            clearCartStorage();
            setShowCheckout(false);
            onPlaceOrder(orderId);
          }}
          onClose={() => {
            console.log('[CartModal] Checkout cerrado');
            setShowCheckout(false);
          }}
          language={language}
        />
      )}
    </>
  );
}