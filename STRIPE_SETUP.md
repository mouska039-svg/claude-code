# Configuration Stripe

## 1. Créer un compte Stripe
Va sur https://stripe.com et crée un compte gratuit.

## 2. Créer tes produits/prix
Dans le dashboard Stripe :
- **Catalogue** → **Produits** → **Ajouter un produit**
- Pour chaque plan (Starter, Pro, Entreprise), crée un prix
- Copie l'ID du prix (commence par `price_...`)
- Remplace les valeurs `price_REPLACE_WITH_*` dans `src/pages/Pricing.tsx`

## 3. Variables d'environnement Supabase
Dans ton dashboard Supabase → **Edge Functions** → **Secrets** :

```
STRIPE_SECRET_KEY=sk_live_...        # Clé secrète Stripe (ou sk_test_ en mode test)
STRIPE_WEBHOOK_SECRET=whsec_...     # Secret du webhook (étape 5)
```

## 4. Déployer les Edge Functions
```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

## 5. Configurer le webhook Stripe
Dans le dashboard Stripe → **Développeurs** → **Webhooks** → **Ajouter un endpoint** :
- URL : `https://<ton-projet>.supabase.co/functions/v1/stripe-webhook`
- Événements à écouter : `checkout.session.completed`
- Copie le **Signing secret** (`whsec_...`) et ajoute-le dans les secrets Supabase (étape 3)

## 6. Ajouter les routes dans App.tsx
```tsx
import Pricing from '@/pages/Pricing';
import PaymentSuccess from '@/pages/PaymentSuccess';

// Dans tes routes :
<Route path="/pricing" element={<Pricing />} />
<Route path="/payment-success" element={<PaymentSuccess />} />
```

## 7. Appliquer la migration SQL
Dans Supabase → **SQL Editor**, exécute le fichier :
`supabase/migrations/20260422000000_create_payments_table.sql`

## 8. Mode test vs production
- Utilise `sk_test_...` et cartes de test Stripe (`4242 4242 4242 4242`) pour tester
- Passe en `sk_live_...` quand tu es prêt à recevoir de vrais paiements
