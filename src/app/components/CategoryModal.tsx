import { Category, Product, CartItem } from '@/lib/types';
import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { fetchProductsByCategory } from '@/lib/helpers';
import { CAT_COLORS, CAT_ICONS } from './colors';
import { IcoBack, IcoBox, IcoCart } from './Icons';
import { getUiText, type SupportedLanguage } from '@/lib/i18n';

export default function CategoryModal({
  category,
  onClose,
  cart,
  onAdd,
  onRemove,
  language,
}: {
  category: Category;
  onClose: () => void;
  cart: CartItem[];
  onAdd: (p: Product) => void;
  onRemove: (id: number) => void;
  language: SupportedLanguage;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = (key: string) => getUiText(language, key);

  console.log(`[CategoryModal] Montando — slug=${category.slug}, id=${category.id}`);

  useEffect(() => {
    console.log(`[CategoryModal] useEffect — fetch productos de "${category.name}"`);
    setLoading(true);
    setError(null);

    fetchProductsByCategory(category.id, language)
      .then((data) => {
        console.log(`[CategoryModal] Productos listos: ${data.length}`);
        setProducts(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error('[CategoryModal] Error inesperado:', err);
        setError('No se pudieron cargar los productos.');
        setLoading(false);
      });
  }, [category.id, category.name, language]);

  // Bloquear scroll
  useEffect(() => {
    console.log('[CategoryModal] Bloqueando body scroll');
    document.body.style.overflow = 'hidden';
    return () => {
      console.log('[CategoryModal] Restaurando body scroll');
      document.body.style.overflow = '';
    };
  }, []);

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { console.log('[CategoryModal] Escape key'); onClose(); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const getQty = (id: number) => cart.find((i) => i.product.id === id)?.quantity ?? 0;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const featured = products.filter((p) => p.is_featured);
  const rest = products.filter((p) => !p.is_featured);
  const colors = CAT_COLORS[category.slug] ?? { bg: '#F5F2ED', text: '#1A1A1A', icon: '#888' };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FAFAF8]">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 bg-white border-b border-[#F0EDE8]">
        <button
          onClick={() => { console.log(`[CategoryModal] Cerrando "${category.name}"`); onClose(); }}
          className="w-9 h-9 rounded-full bg-[#F5F2ED] flex items-center justify-center text-[#1A1A1A] active:scale-95 transition-transform"
          aria-label={t('categoryModalBackAria')}
        >
          <IcoBack />
        </button>
    
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: colors.bg, color: colors.icon }}
        >
          <span style={{ transform: 'scale(0.72)', display: 'block', lineHeight: 0 }}>
            {CAT_ICONS[category.slug] ?? <IcoBox />}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-[#9B9589] uppercase tracking-widest">{t('categoryModalHeaderLabel')}</p>
          <h2 className="text-[17px] font-bold text-[#1A1A1A] leading-tight truncate">{category.name}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-7 h-7 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-[#9B9589]">{t('categoryModalLoading')}</p>
          </div>
        )}

        {!loading && error && (
          <div className="m-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] p-4">
            <p className="text-[14px] font-semibold text-[#DC2626]">{t('categoryModalErrorTitle')}</p>
            <p className="text-[12px] text-[#9B9589] mt-1">{error}</p>
            <p className="text-[11px] text-[#9B9589] mt-2">{t('categoryModalErrorConsole')}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-2 px-8 text-center">
            <p className="text-[15px] text-[#9B9589]">{t('categoryModalEmptyTitle')}</p>
            <p className="text-[11px] text-[#C0BDB8]">{t('categoryModalEmptyDescription')}</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="px-4 pb-32">
            {featured.length > 0 && (
              <>
                <p className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest mt-4 mb-0.5">
                  {t('categoryModalMoreOrdered')}
                </p>
                {featured.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    quantity={getQty(p.id)}
                    onAdd={() => onAdd(p)}
                    onRemove={() => onRemove(p.id)}
                    lang={language}
                  />
                ))}
              </>
            )}
            {rest.length > 0 && (
              <>
                {featured.length > 0 && (
                  <p className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest mt-5 mb-0.5">
                    {t('categoryModalAll')}
                  </p>
                )}
                {rest.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    quantity={getQty(p.id)}
                    onAdd={() => onAdd(p)}
                    onRemove={() => onRemove(p.id)}
                    lang={language}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Sticky CTA si hay items en carrito */}
      {cartCount > 0 && (
        <div className="px-4 pb-5 pt-3 bg-white border-t border-[#F0EDE8]">
          <button
            onClick={() => { console.log('[CategoryModal] CTA "ver carrito" pulsado'); onClose(); }}
            className="w-full bg-[#1A1A1A] text-white rounded-2xl py-3.5 text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <IcoCart size={17} />
            {t('categoryModalViewCart')} · {cartCount} {cartCount === 1 ? t('categoryModalItemsOne') : t('categoryModalItemsMany')}
          </button>
        </div>
      )}
    </div>
  );
}
