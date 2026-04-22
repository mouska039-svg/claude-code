import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
        <CheckCircle2 className="h-20 w-20 text-green-500" />
        <h1 className="text-3xl font-bold">Paiement réussi !</h1>
        <p className="text-muted-foreground">
          Merci pour votre achat. Votre paiement a bien été reçu et votre accès est activé.
        </p>
        {sessionId && (
          <p className="text-xs text-muted-foreground font-mono break-all">
            Référence : {sessionId}
          </p>
        )}
        <Button asChild className="w-full">
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    </div>
  );
}
