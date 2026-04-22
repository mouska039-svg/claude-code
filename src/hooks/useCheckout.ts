import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async (priceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      setError(err.message ?? 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  return { checkout, loading, error };
}
