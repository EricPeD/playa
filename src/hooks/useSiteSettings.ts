import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useSiteSettings() {
  const [publicBlocked, setPublicBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSetting = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('site_settings')
      .select('public_blocked')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.error('[useSiteSettings] Error al cargar estado del sitio:', error);
      setError(error.message);
      setPublicBlocked(false);
      setLoading(false);
      return;
    }

    setPublicBlocked(Boolean(data?.public_blocked));
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchSetting();
  }, [fetchSetting]);

  const updateSetting = useCallback(async (nextValue: boolean) => {
    setError(null);

    const { data, error } = await supabase
      .from('site_settings')
      .upsert(
        {
          id: 1,
          public_blocked: nextValue,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select('public_blocked')
      .single();

    if (error) {
      console.error('[useSiteSettings] Error al actualizar estado del sitio:', error);
      setError(error.message);
      return false;
    }

    setPublicBlocked(Boolean(data?.public_blocked));
    return true;
  }, []);

  return {
    publicBlocked,
    loading,
    error,
    refresh: fetchSetting,
    setPublicBlocked: updateSetting,
  };
}
