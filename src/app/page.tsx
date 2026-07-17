'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, Product, CartItem } from '@/lib/types';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { fetchCategories, requestGPS } from '@/lib/helpers';
import { CART_STORAGE_KEY, clearCartStorage, readCartFromStorage, writeCartToStorage } from '@/lib/cart';
import { IcoBox, IcoCart, IcoCheck, IcoPin, IcoPinOff } from '@/app/components/Icons';
import CategoryModal from '@/app/components/CategoryModal';
import Link from 'next/link';
import { CAT_COLORS, CAT_ICONS } from './components/colors';
import { CartModal } from './components/CartModal';
import {
  DEFAULT_LANGUAGE,
  getStoredLanguage,
  getUiText,
  normalizeLanguage,
  setStoredLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/lib/i18n';

// ─── LanguageSelector ───────────────────────────────────────────────────────

function LanguageSelector({ onSelect }: { onSelect: (code: string) => void }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold text-[#9B9589] uppercase tracking-[0.25em]">
            Playa Delivery
          </p>
          <h1 className="text-[28px] font-black text-[#1A1A1A] leading-[1.1] mt-1.5">
            {getUiText(DEFAULT_LANGUAGE, 'languageSelectorTitle')}
          </h1>
          <p className="text-[13px] text-[#9B9589] mt-1.5 leading-snug">
            {getUiText(DEFAULT_LANGUAGE, 'languageSelectorSubtitle')}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                console.log('[LanguageSelector] idioma seleccionado:', lang.code);
                onSelect(lang.code);
              }}
              className="w-full flex items-center gap-4 rounded-2xl bg-white border border-[#E8E5E0] px-5 py-4 active:scale-[0.97] transition-transform"
            >
              <span className="text-[26px] leading-none">{lang.flag}</span>
              <span className="text-[16px] font-semibold text-[#1A1A1A]">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catsError, setCatsError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsData, setGpsData] = useState<{ latitude: number; longitude: number } | null>(null);

  const [orderDone, setOrderDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [languageSelected, setLanguageSelected] = useState(false);
  const { publicBlocked, loading: settingsLoading } = useSiteSettings();

  const t = useCallback((key: string) => getUiText(language, key), [language]);

  console.log('[HomePage] Render — cats:', categories.length, '| cart:', cart.length, '| gps:', gpsEnabled, '| lang:', language);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedLanguage = getStoredLanguage();
      if (storedLanguage) {
        setLanguage(storedLanguage);
        setLanguageSelected(true);
      }

      const storedCart = readCartFromStorage();
      if (storedCart.length > 0) {
        setCart(storedCart);
      }
    } catch (error) {
      console.error('[HomePage] Error al restaurar storage:', error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    if (cart.length === 0) {
      clearCartStorage();
    } else {
      writeCartToStorage(cart);
    }
  }, [cart, hydrated]);

  // Cargar categorías (solo cuando ya hay idioma seleccionado)
  useEffect(() => {
    if (!languageSelected) return;

    console.log('[HomePage] useEffect mount — cargando categorías');
    setLoadingCats(true);
    setCatsError(null);

    fetchCategories(language)
      .then((data) => {
        console.log('[HomePage] Categorías OK:', data.length, data.map((c) => `${c.name}(${c.id})`));
        setCategories(data);
        setLoadingCats(false);
      })
      .catch((err: unknown) => {
        console.error('[HomePage] Error inesperado:', err);
        setCatsError(t('homeErrorDescription'));
        setLoadingCats(false);
      });
  }, [language, languageSelected, t]);

  // Selección de idioma
  const handleSelectLanguage = useCallback((code: string) => {
    const normalized = normalizeLanguage(code);
    setLanguage(normalized);
    setStoredLanguage(normalized);
    setLanguageSelected(true);
  }, []);

  // Cart actions
  const addToCart = useCallback((product: Product) => {
    console.log('[Cart] addToCart:', product.name, `(id=${product.id})`);
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const next = existing
        ? prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { product, quantity: 1 }];
      console.log('[Cart] nuevo estado:', next.map((i) => `${i.product.name}x${i.quantity}`).join(', '));
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    console.log('[Cart] removeFromCart id:', productId);
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (!existing) {
        console.warn('[Cart] id no encontrado en carrito:', productId);
        return prev;
      }
      const next = existing.quantity === 1
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i);
      console.log('[Cart] nuevo estado:', next.map((i) => `${i.product.name}x${i.quantity}`).join(', '));
      return next;
    });
  }, []);

  // GPS
  const handleGps = useCallback(() => {
    console.log('[HomePage] handleGps — estado actual:', gpsEnabled);
    setGpsError(null);
    requestGPS(
      (coords) => {
        console.log('[HomePage] GPS activado. Coords:', coords.latitude, coords.longitude);
        setGpsEnabled(true);
        setGpsData({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      (msg) => {
        console.error('[HomePage] GPS error:', msg);
        setGpsError(msg);
        setGpsEnabled(false);
      },
    );
  }, [gpsEnabled]);

  // Place order
  const handlePlaceOrder = useCallback(async () => {
    const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    console.group('[Order] Creando pedido');
    console.log('Items:', cart.map((i) => `${i.product.name} x${i.quantity}`));
    console.log('Total:', total.toFixed(2), '€');
    console.log('GPS activo:', gpsEnabled);

    // TODO: insertar en Supabase
    // const { data, error } = await supabase.from('orders').insert({
    //   status: 'pending',
    //   subtotal: total,
    //   total: total,
    //   payment_method: 'bizum',
    // });
    // console.log('Supabase order result:', data, error);

    console.log('Pedido enviado (simulado). Limpiando estado...');
    console.groupEnd();

    setCart([]);
    clearCartStorage();
    setCartOpen(false);
    setOrderDone(true);
    setTimeout(() => setOrderDone(false), 4000);
  }, [cart, gpsEnabled]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  useEffect(() => {
    console.log('gpsData actualizado:', gpsData);
  }, [gpsData]);

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[10px] font-bold text-[#9B9589] uppercase tracking-[0.25em]">Playa Delivery</p>
          <p className="mt-3 text-[14px] text-[#1A1A1A]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (publicBlocked) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[24px] border border-[#E8E5E0] bg-white p-6 text-center shadow-sm">
          <p className="text-[10px] font-bold text-[#9B9589] uppercase tracking-[0.25em]">Playa Delivery</p>
          <h1 className="mt-3 text-[24px] font-black text-[#1A1A1A]">Abriremos de nuevo mañana</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#6F6A61]">
            El servicio está temporalmente cerrado. Gracias por tu comprensión.
          </p>
        </div>
      </div>
    );
  }

  // ── Pantalla de selección de idioma ──
  if (!languageSelected) {
    return <LanguageSelector onSelect={handleSelectLanguage} />;
  }

  // ── Pantalla principal ──
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col max-w-md mx-auto relative">
      <header className="px-5 pt-8 pb-5">
        <p className="text-[10px] font-bold text-[#9B9589] uppercase tracking-[0.25em]">
          {t('appBrand')}
        </p>
        <h1 className="text-[30px] font-black text-[#1A1A1A] leading-[1.1] mt-1.5">
          {t('homeTitleLine1')}<br />{t('homeTitleLine2')}
        </h1>
        <p className="text-[13px] text-[#9B9589] mt-1.5 leading-snug">
          {t('homeSubtitle')}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition ${language === lang.code ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#E0DDD8] bg-white text-[#1A1A1A]'}`}
            >
              {lang.flag} {lang.code.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* ── Categorías ── */}
      <main className="flex-1 px-4 pb-28">

        {/* Error */}
        {catsError && (
          <div className="rounded-2xl bg-[#FEF2F2] border border-[#FECACA] p-4 mb-4">
            <p className="text-[14px] font-semibold text-[#DC2626]">{t('homeErrorTitle')}</p>
            <p className="text-[12px] text-[#9B9589] mt-1">{catsError}</p>
            <p className="text-[11px] text-[#9B9589] mt-2">{t('homeErrorConsole')}</p>
          </div>
        )}

        {/* Skeleton */}
        {loadingCats && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[120px] rounded-3xl bg-[#EDEBE6] animate-pulse" />
            ))}
          </div>
        )}

        {/* Grid */}
        {!loadingCats && categories.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const colors = CAT_COLORS[cat.slug] ?? { bg: '#F5F2ED', text: '#1A1A1A', icon: '#888' };
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    console.log(`[HomePage] Categoría pulsada: ${cat.name} (slug=${cat.slug}, id=${cat.id})`);
                    setSelectedCategory(cat);
                  }}
                  className="rounded-3xl p-4 flex flex-col justify-between h-[120px] text-left active:scale-[0.96] transition-transform"
                  style={{ backgroundColor: colors.bg }}
                >
                  <span style={{ color: colors.icon }}>
                    {CAT_ICONS[cat.slug] ?? <IcoBox />}
                  </span>
                  <div>
                    <p className="text-[15px] font-bold leading-tight" style={{ color: colors.text }}>
                      {cat.name}
                    </p>
                    {cat.description && (
                      <p
                        className="text-[11px] mt-0.5 leading-snug line-clamp-1"
                        style={{ color: colors.text, opacity: 0.6 }}
                      >
                        {cat.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loadingCats && !catsError && categories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#D0CCC5] p-8 text-center mt-2">
            <p className="text-[15px] font-semibold text-[#1A1A1A]">{t('homeEmptyTitle')}</p>
            <p className="text-[13px] text-[#9B9589] mt-1">{t('homeEmptyDescription')}</p>
            <p className="text-[11px] text-[#C0BDB8] mt-2">{t('homeEmptyConsole')}</p>
          </div>
        )}
      </main>

      {/* ── Toast pedido OK ── */}
      {orderDone && (
        <div className="fixed top-4 left-4 right-4 max-w-md mx-auto z-[60]">
          <div className="bg-[#1A1A1A] text-white rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-[#4ADE80]"><IcoCheck size={22} /></span>
            <div>
              <p className="text-[15px] font-semibold">{t('homeOrderToastTitle')}</p>
              <p className="text-[12px] text-white/50">{t('homeOrderToastSubtitle')}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 px-3 pb-4 pt-1.5">
        <div className="bg-white rounded-3xl border border-[#E8E5E0] px-2.5 py-2 flex gap-2">

          {/* GPS */}
          <button
            onClick={() => { console.log('[BottomNav] GPS pulsado'); handleGps(); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-[13px] font-semibold transition-all active:scale-95 ${
              gpsEnabled ? 'bg-[#F0FFF4] text-[#16A34A]' : 'bg-[#F5F2ED] text-[#1A1A1A]'
            }`}
          >
            {gpsEnabled ? <IcoPin size={17} /> : <IcoPinOff size={17} />}
            <span>{gpsEnabled ? t('homeGpsButtonActive') : t('homeGpsButtonInactive')}</span>
          </button>

          {/* Tracking */}
          <Link
            href="/tracking"
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#F5F2ED] text-[#1A1A1A] text-[13px] font-semibold transition-all active:scale-95"
          >
            <IcoBox size={17} />
            <span>Tracking</span>
          </Link>

          {/* Cart */}
          <button
            onClick={() => { console.log('[BottomNav] Carrito pulsado. items:', cartCount); setCartOpen(true); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#1A1A1A] text-white text-[13px] font-semibold active:scale-95 transition-transform relative"
          >
            <IcoCart size={17} />
            <span>{cartCount > 0 ? `${cartTotal.toFixed(2)} €` : t('homeCartButton')}</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1 w-5 h-5 bg-[#E65100] text-white text-[11px] font-bold rounded-full flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {gpsError && (
          <p className="text-[11px] text-[#DC2626] text-center mt-1.5 px-2 leading-snug">{gpsError}</p>
        )}
      </nav>

      {/* ── Modales ── */}
      {selectedCategory && (
        <CategoryModal
          category={selectedCategory}
          onClose={() => { console.log(`[HomePage] Cerrando modal cat: ${selectedCategory.name}`); setSelectedCategory(null); }}
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          language={language}
        />
      )}

      {cartOpen && (
        <CartModal
          cart={cart}
          onClose={() => { console.log('[HomePage] Cerrando carrito'); setCartOpen(false); }}
          gpsEnabled={gpsEnabled}
          gpsError={gpsError}
          onRequestGps={handleGps}
          onPlaceOrder={handlePlaceOrder}
          onAdd={addToCart}
          onRemove={removeFromCart}
          gpsData={gpsData}
          language={language}
        />
      )}
    </div>
  );
}