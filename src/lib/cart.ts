import type { CartItem } from '@/lib/types';

export const CART_STORAGE_KEY = 'playa-cart';

export function readCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch (error) {
    console.error('[cart] Error al leer storage:', error);
    return [];
  }
}

export function writeCartToStorage(cart: CartItem[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('[cart] Error al guardar storage:', error);
  }
}

export function clearCartStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('[cart] Error al limpiar storage:', error);
  }
}
