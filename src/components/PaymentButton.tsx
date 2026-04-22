import { Button } from '@/components/ui/button';
import { useCheckout } from '@/hooks/useCheckout';
import { Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  priceId: string;
  label?: string;
  className?: string;
}

export function PaymentButton({ priceId, label = 'Payer maintenant', className }: PaymentButtonProps) {
  const { checkout, loading, error } = useCheckout();

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        className={className}
        disabled={loading}
        onClick={() => checkout(priceId)}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {label}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
