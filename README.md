# JobBoost FR

SaaS B2C : diagnostic d'activité, annonces générées par IA, simulateur « Net dans la poche », devis/factures PDF, abonnement Premium (Stripe).

## Démarrage

```bash
cp .env.example .env.local   # renseigner les variables
npm install
npm run dev
```

1. Supabase : exécuter `supabase/migrations/0001_init.sql` puis `0002_invoice_details.sql` (éditeur SQL ou `supabase db push`). Activer Magic Link et Google dans Authentication, avec `<SITE_URL>/auth/callback` en URL de redirection.
2. Stripe : créer un produit récurrent à 6,99 €/mois, renseigner `STRIPE_PREMIUM_PRICE_ID`. Webhook vers `/api/webhooks/stripe` (événements `checkout.session.completed`, `customer.subscription.created|updated|deleted`). En local : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
3. IA : `AI_PROVIDER=openai|anthropic` avec la clé correspondante.

## Points d'attention

- Les taux et plafonds fiscaux sont centralisés dans `src/lib/tax.ts` : à vérifier chaque année.
- `subscription_status` et `stripe_customer_id` ne sont modifiables que via le service role (RLS + grants).
