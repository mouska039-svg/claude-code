import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Payment {
  id: string;
  customer_email: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export function PaymentsTable() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPayments(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-muted-foreground text-sm">Chargement...</p>;
  if (!payments.length) return <p className="text-muted-foreground text-sm">Aucun paiement pour l'instant.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-3 pr-4">Email</th>
            <th className="pb-3 pr-4">Montant</th>
            <th className="pb-3 pr-4">Statut</th>
            <th className="pb-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-b last:border-0">
              <td className="py-3 pr-4">{p.customer_email ?? '—'}</td>
              <td className="py-3 pr-4">
                {(p.amount / 100).toFixed(2)} {p.currency.toUpperCase()}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {p.status}
                </span>
              </td>
              <td className="py-3">
                {new Date(p.created_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
