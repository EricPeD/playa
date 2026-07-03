import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Product } from '@/lib/types';

export type ProductWithCategory = Product & {
  category_name: string;
  category_emoji: string | null;
};

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  Bebidas: '🥤',
  Alcohol: '🍺',
  Bocadillos: '🥪',
  Snacks: '🍟',
  Helados: '🍦',
  Fumadores: '🚬',
  Farmacia: '💊',
  Playa: '☀️',
  Packs: '🎁',
};

export function useProducts() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; emoji: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!loadedOnce) setLoading(true);
    setError(null);

    const [{ data: prodData, error: prodError }, { data: catData, error: catError }] = await Promise.all([
      supabase
        .from('products')
        .select('id, category_id, sku, name, brand, description, price, cost_price, stock, unit, image_url, badge, is_featured, is_active, is_pack, sort_order, created_at, categories(name, emoji))')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true }),
      supabase
        .from('categories')
        .select('id, name, emoji')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ]);

    if (prodError || catError) {
      setError(prodError?.message ?? catError?.message ?? 'Error al cargar productos.');
      setLoading(false);
      setLoadedOnce(true);
      return;
    }

    const normalized = (prodData ?? []).map((product: any) => ({
      ...product,
      category_name: product.categories?.name ?? 'Sin categoría',
      category_emoji: product.categories?.emoji ?? CATEGORY_EMOJI_MAP[product.categories?.name ?? ''] ?? null,
      price: parseFloat(product.price ?? '0') || 0,
      cost_price: product.cost_price ? parseFloat(product.cost_price) : null,
      stock: product.stock ?? 0,
    }));

    setProducts(normalized);
    setCategories((catData ?? []).map((cat: any) => ({ id: cat.id, name: cat.name, emoji: cat.emoji })));
    setLoading(false);
    setLoadedOnce(true);
  }, [loadedOnce]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateProduct = useCallback(async (id: number, changes: Partial<Product>) => {
    if (!loadedOnce) setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('products')
      .update(changes)
      .eq('id', id);

    if (error) {
      setError(error.message);
      if (!loadedOnce) setLoading(false);
      return false;
    }

    await fetchProducts();
    return true;
  }, [fetchProducts, loadedOnce]);

  const toggleActive = useCallback(async (id: number, active: boolean) => {
    return updateProduct(id, { is_active: active });
  }, [updateProduct]);

  const adjustStock = useCallback(async (id: number, delta: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return false;
    const nextStock = Math.max(0, (product.stock ?? 0) + delta);
    return updateProduct(id, { stock: nextStock });
  }, [products, updateProduct]);

  return {
    products,
    categories,
    loading,
    error,
    refresh: fetchProducts,
    toggleActive,
    adjustStock,
  };
}
