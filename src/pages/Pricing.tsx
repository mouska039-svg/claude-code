import { PaymentButton } from '@/components/PaymentButton';
import { Check } from 'lucide-react';

// Replace these with your real Stripe Price IDs from your Stripe dashboard
const PLANS = [
  {
    name: 'Starter',
    price: '29€',
    priceId: 'price_REPLACE_WITH_STARTER_PRICE_ID',
    description: 'Idéal pour démarrer',
    features: ['5 projets', 'Support par email', 'Accès aux rapports'],
  },
  {
    name: 'Pro',
    price: '79€',
    priceId: 'price_REPLACE_WITH_PRO_PRICE_ID',
    description: 'Pour les équipes qui grandissent',
    features: ['Projets illimités', 'Support prioritaire', 'Accès complet', 'Export CSV'],
    highlighted: true,
  },
  {
    name: 'Entreprise',
    price: '199€',
    priceId: 'price_REPLACE_WITH_ENTERPRISE_PRICE_ID',
    description: 'Solutions sur mesure',
    features: ['Tout le plan Pro', 'Onboarding dédié', 'SLA garanti', 'Facturation personnalisée'],
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Nos tarifs</h1>
          <p className="text-muted-foreground text-lg">Choisissez le plan adapté à vos besoins</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col gap-6 ${
                plan.highlighted
                  ? 'border-primary shadow-lg bg-primary/5 ring-2 ring-primary'
                  : 'border-border bg-card'
              }`}
            >
              {plan.highlighted && (
                <span className="self-start text-xs font-semibold uppercase tracking-widest text-primary">
                  Populaire
                </span>
              )}
              <div>
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
              </div>
              <div className="text-4xl font-extrabold">
                {plan.price}
                <span className="text-base font-normal text-muted-foreground">/mois</span>
              </div>
              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <PaymentButton
                priceId={plan.priceId}
                label={`Choisir ${plan.name}`}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
