import { supabase } from '@/lib/supabase';
import { SupportedLanguage } from '@/lib/i18n';
import { Category, Product } from './types';

export async function fetchCategories(lang: SupportedLanguage): Promise<Category[]> {
  console.group('[fetchCategories]');
  console.log('Iniciando query...');
  console.log('Idioma:', lang);
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'undefined ⚠️');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY definida:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const [categoriesResult, translationsResult] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('category_translations')
      .select('category_id, name, description')
      .eq('lang', lang),
  ]);

  console.log('HTTP status categories:', categoriesResult.status);
  console.log('Error categories:', categoriesResult.error);
  console.log('Count categories:', categoriesResult.data?.length ?? 0);
  console.log('Translations status:', translationsResult.status);
  console.log('Translations error:', translationsResult.error);

  if (categoriesResult.error) {
    console.error('ERROR SUPABASE CATEGORIES:', categoriesResult.error.code, categoriesResult.error.message);
    console.error('Hint:', categoriesResult.error.hint);
    console.error('Details:', categoriesResult.error.details);
    console.groupEnd();
    return [];
  }

  const translations = (translationsResult.data ?? []).filter((item): item is { category_id: number; name: string | null; description: string | null } => Boolean(item));
  const translationsByCategoryId = new Map<number, { name: string | null; description: string | null }>();
  translations.forEach((item) => {
    translationsByCategoryId.set(item.category_id, { name: item.name, description: item.description });
  });

  const mapped = (categoriesResult.data ?? []).map((category) => {
    const translation = translationsByCategoryId.get(category.id);
    return {
      ...category,
      name: translation?.name ?? category.name,
      description: translation?.description ?? category.description ?? null,
    } as Category;
  });

  console.groupEnd();
  return mapped;
}

export async function fetchProductsByCategory(categoryId: number, lang: SupportedLanguage): Promise<Product[]> {
  console.group(`[fetchProductsByCategory] category_id=${categoryId}`);
  console.log('Idioma:', lang);
  console.log('Iniciando query...');

  const [productsResult, translationsResult] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('product_translations')
      .select('product_id, name, description')
      .eq('lang', lang),
  ]);

  console.log('HTTP status products:', productsResult.status);
  console.log('Error products:', productsResult.error);
  console.log('Productos:', productsResult.data?.length ?? 0);
  console.log('Translations status:', translationsResult.status);
  console.log('Translations error:', translationsResult.error);

  if (productsResult.error) {
    console.error('ERROR SUPABASE PRODUCTS:', productsResult.error.code, productsResult.error.message);
    console.error('Hint:', productsResult.error.hint);
    console.groupEnd();
    return [];
  }

  const translations = (translationsResult.data ?? []).filter((item): item is { product_id: number; name: string | null; description: string | null } => Boolean(item));
  const translationsByProductId = new Map<number, { name: string | null; description: string | null }>();
  translations.forEach((item) => {
    translationsByProductId.set(item.product_id, { name: item.name, description: item.description });
  });

  const mapped = (productsResult.data ?? []).map((product) => {
    const translation = translationsByProductId.get(product.id);
    return {
      ...product,
      name: translation?.name ?? product.name,
      description: translation?.description ?? product.description ?? null,
    } as Product;
  });

  console.groupEnd();
  return mapped;
}

// ─── GPS helper ───────────────────────────────────────────────────────────────

export function requestGPS(
  onSuccess: (coords: GeolocationCoordinates) => void,
  onError: (msg: string) => void,
) {
  console.group('[GPS]');
  console.log('Comprobando soporte navigator.geolocation...');

  if (!navigator.geolocation) {
    const msg = 'El navegador no soporta geolocalización.';
    console.error(msg);
    console.groupEnd();
    onError(msg);
    return;
  }

  console.log('Soporte OK. Solicitando permiso...');

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      console.log('Posición obtenida:');
      console.log('  lat:', pos.coords.latitude);
      console.log('  lng:', pos.coords.longitude);
      console.log('  accuracy:', pos.coords.accuracy, 'm');
      console.log('  timestamp:', new Date(pos.timestamp).toISOString());
      console.groupEnd();
      onSuccess(pos.coords);
    },
    (err) => {
      const codeMap: Record<number, string> = {
        1: 'Permiso denegado. Actívalo en los ajustes del navegador.',
        2: 'Posición no disponible. Comprueba tu conexión o GPS.',
        3: 'Timeout. Inténtalo de nuevo.',
      };
      const msg = codeMap[err.code] ?? `Error desconocido (code ${err.code})`;
      console.error('Error GPS:');
      console.error('  code:', err.code);
      console.error('  message:', err.message);
      console.error('  msg para usuario:', msg);
      console.groupEnd();
      onError(msg);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
}