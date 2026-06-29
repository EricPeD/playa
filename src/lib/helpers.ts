import { supabase } from '@/lib/supabase';
import { Category, Product } from './types';


export async function fetchCategories(): Promise<Category[]> {
  console.group('[fetchCategories]');
  console.log('Iniciando query...');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'undefined ⚠️');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY definida:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const result = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  console.log('HTTP status:', result.status);
  console.log('Error:', result.error);
  console.log('Count:', result.data?.length ?? 0);
  console.log('Data:', result.data);

  if (result.error) {
    console.error('ERROR SUPABASE:', result.error.code, result.error.message);
    console.error('Hint:', result.error.hint);
    console.error('Details:', result.error.details);
    console.groupEnd();
    return [];
  }

  console.groupEnd();
  return result.data ?? [];
}

export async function fetchProductsByCategory(categoryId: number): Promise<Product[]> {
  console.group(`[fetchProductsByCategory] category_id=${categoryId}`);
  console.log('Iniciando query...');

  const result = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('sort_order');

  console.log('HTTP status:', result.status);
  console.log('Error:', result.error);
  console.log('Productos:', result.data?.length ?? 0);
  console.log('Data:', result.data);

  if (result.error) {
    console.error('ERROR SUPABASE:', result.error.code, result.error.message);
    console.error('Hint:', result.error.hint);
    console.groupEnd();
    return [];
  }

  console.groupEnd();
  return result.data ?? [];
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