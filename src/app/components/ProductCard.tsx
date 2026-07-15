'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { IcoPlus, IcoBox, IcoMinus } from './Icons';
import type { Product } from '@/lib/types';
import { BadgePill } from './BadgePill';
import { getUiText } from '@/lib/i18n';

const BADGE_TYPES = ['nuevo', 'oferta', 'top'] as const;
type BadgeType = (typeof BADGE_TYPES)[number];

function normalizeBadge(badge?: string | null): BadgeType | null {
  if (!badge) return null;
  return BADGE_TYPES.find((type) => type === badge.toLowerCase()) ?? null;
}

function IcoX({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function ProductCard({
  product,
  quantity,
  onAdd,
  onRemove,
  lang,
}: {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  lang?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQty, setSelectedQty] = useState(Math.max(quantity, 1));

  const hasImage = Boolean(product.image_url);
  const imageSrc = "https://cxusgnrvoeehkgwodhnh.supabase.co/storage/v1/object/public/images/" + product.sku + ".webp";

  const t = (key: string) => getUiText(lang, key);

  const openModal = () => {
    setSelectedQty(Math.max(quantity, 1));
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  // Si la cantidad en carrito cambia mientras el modal está cerrado, resincroniza el selector
  useEffect(() => {
    if (!isOpen) {
      setSelectedQty(Math.max(quantity, 1));
    }
  }, [quantity, isOpen]);

  const incrementSelected = () => setSelectedQty((q) => q + 1);
  const decrementSelected = () => setSelectedQty((q) => Math.max(1, q - 1));

  const handleConfirmAdd = () => {
    const diff = selectedQty - quantity;
    console.log(`[ProductCard] Confirmar añadir (modal): ${product.name}, qty carrito=${quantity}, qty seleccionada=${selectedQty}, diff=${diff}`);

    if (diff > 0) {
      for (let i = 0; i < diff; i++) onAdd();
    } else if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++) onRemove();
    }
    closeModal();
  };
console.log('[ProductCard debug] lang=', lang, '| productCardAddButton=', getUiText(lang, 'productCardAddButton'));
  return (
    <>
      <div
        onClick={openModal}
        className="flex items-center gap-3 py-3.5 border-b border-[#F0EDE8] last:border-0 cursor-pointer"
      >
        {/* Thumb */}
        <div className="w-[56px] h-[56px] rounded-xl bg-[#F5F2ED] flex items-center justify-center shrink-0 overflow-hidden text-[#B0ABA4]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              width={56}
              height={56}
              className="h-full w-full object-cover"
              unoptimized={imageSrc.startsWith('http')}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg">
              {product.badge ? product.badge : '🫖'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[14px] font-semibold text-[#1A1A1A] leading-snug">{product.name}</p>
            {product.badge && <BadgePill type={product.badge as 'nuevo' | 'oferta' | 'top'} />}
          </div>
          {product.brand && (
            <p className="text-[11px] text-[#9B9589] mt-0.5">{product.brand}</p>
          )}
          <p className="text-[15px] font-bold text-[#1A1A1A] mt-1">{Number(product.price).toFixed(2)} €</p>
        </div>

        {/* Quantity control rápido (en la tarjeta) */}
        {quantity === 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log(`[ProductCard] + pulsado: ${product.name} (id=${product.id})`);
              onAdd();
            }}
            disabled={product.stock === 0}
            className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform shrink-0"
            aria-label={`${t('productCardAddAria')} ${product.name}`}
          >
            <IcoPlus size={17} />
          </button>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log(`[ProductCard] - pulsado: ${product.name} (id=${product.id}), qty actual=${quantity}`);
                onRemove();
              }}
              className="w-8 h-8 rounded-full border border-[#E0DDD8] text-[#1A1A1A] flex items-center justify-center active:scale-95 transition-transform"
              aria-label={`${t('productCardRemoveAria')} ${product.name}`}
            >
              <IcoMinus size={15} />
            </button>
            <span className="text-[14px] font-bold w-5 text-center tabular-nums">{quantity}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log(`[ProductCard] + pulsado (ya en carrito): ${product.name}, qty actual=${quantity}`);
                onAdd();
              }}
              className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center active:scale-95 transition-transform"
              aria-label={`${t('productCardMoreAria')} ${product.name}`}
            >
              <IcoPlus size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button
              onClick={closeModal}
              aria-label={t('productCardCloseAria')}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 text-[#1A1A1A] flex items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              <IcoX size={18} />
            </button>

            {/* Large image */}
            <div className="w-full aspect-square bg-[#F5F2ED] flex items-center justify-center shrink-0 overflow-hidden">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover"
                  unoptimized={imageSrc.startsWith('http')}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl">
                  {product.badge ? product.badge : '🫖'}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-[18px] font-semibold text-[#1A1A1A] leading-snug">{product.name}</h2>
                {product.badge && <BadgePill type={product.badge as 'nuevo' | 'oferta' | 'top'} />}
              </div>

              {product.brand && (
                <p className="text-[12px] text-[#9B9589] mt-1">{product.brand}</p>
              )}

              {product.description && (
                <p className="text-[14px] text-[#4A4A4A] mt-3 leading-relaxed">{product.description}</p>
              )}

              <p className="text-[20px] font-bold text-[#1A1A1A] mt-4">{Number(product.price).toFixed(2)} €</p>

              {/* Selector de cantidad + botón Añadir */}
              <div className="mt-5 flex items-center gap-3">
                <div className="flex items-center gap-3 border border-[#E0DDD8] rounded-full px-2 py-1.5">
                  <button
                    onClick={decrementSelected}
                    disabled={selectedQty <= 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#1A1A1A] disabled:opacity-30 active:scale-95 transition-transform"
                    aria-label={t('productCardDecreaseAria')}
                  >
                    <IcoMinus size={15} />
                  </button>
                  <span className="text-[16px] font-bold w-6 text-center tabular-nums">{selectedQty}</span>
                  <button
                    onClick={incrementSelected}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#1A1A1A] disabled:opacity-30 active:scale-95 transition-transform"
                    aria-label={t('productCardIncreaseAria')}
                  >
                    <IcoPlus size={15} />
                  </button>
                </div>

                <button
                  onClick={handleConfirmAdd}
                  disabled={product.stock === 0}
                  className="flex-1 h-11 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center gap-2 disabled:opacity-30 active:scale-95 transition-transform text-[14px] font-semibold"
                >
                  <IcoPlus size={17} />
                  {t('productCardAddButton')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}