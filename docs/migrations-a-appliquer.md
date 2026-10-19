# Migrations Supabase à appliquer (0007 à 0013)

État au 16 octobre 2026. Les migrations 0001 à 0006 sont déjà appliquées sur le Supabase de production (confirmé dans `TASKS.md`). Restent 0007 à 0012 (0012 a été appliquée le 19 octobre 2026 par le propriétaire). Aucune n'a été appliquée par l'assistant : il n'a pas accès à votre projet Supabase.

Les 11 fichiers `supabase/migrations/*.sql` ont été rejoués dans l'ordre sur un PostgreSQL de test (PGlite, avec des substituts pour le schéma `auth` et les rôles Supabase) : aucune erreur, résultats des contrôles ci-dessous conformes, rejeu de 0007 et 0008 sans erreur. Ce test ne remplace pas l'essai sur votre vraie base.

## Ordre et effet

| # | Fichier | Crée ou modifie | Nécessaire pour | Appliquer avant |
|---|---|---|---|---|
| 1 | `0007_listing_variants.sql` | colonne `listings.variants` (jsonb) | génération d'annonces multi-sites (T20) | de déployer le code actuel |
| 2 | `0008_listing_platforms.sql` | 18 valeurs ajoutées au type `listing_platform` | les 21 plateformes du générateur (T21) | de déployer le code actuel |
| 3 | `0009_testimonials.sql` | table `testimonials` + RLS | page Annonces du tableau de bord et preuve sociale (T24) | de déployer le code actuel |
| 4 | `0010_newsletter.sql` | table `newsletter_subscribers` + RLS | inscription à la newsletter (T25) | de définir `NEWSLETTER_ENABLED=true` |
| 5 | `0011_newsletter_campaigns.sql` | tables `newsletter_campaigns` et `newsletter_deliveries` + RLS | envoi des newsletters (T25) | du premier envoi |
| 7 | `0013_quota_ratelimit_billing.sql` | tables `listing_reservations`, `rate_limits` ; colonnes `listing_credit_grants.stripe_payment_intent`, `profiles.past_due_since` ; fonctions `claim_listing_slot`, `release_listing_slot`, `rate_limit_hit`, `revoke_listing_credits`, `mark_past_due`, `expire_past_due_subscriptions` ; remplace `grant_listing_credits` | de la génération d'annonces et du webhook Stripe | de déployer le code actuel |
| 6 | `0012_invoice_integrity.sql` | colonnes `number`, `number_year`, `reference`, `issuer_*` sur `invoices`, déclencheurs, droits | des factures (numérotation, immuabilité) | de déployer le code actuel |

**Appliquer 0007, 0008, 0009, 0012 et 0013 avant de déployer cette branche** : sans 0009, la page Annonces du tableau de bord échoue à lire `testimonials` ; sans 0007 et 0008, la génération d'annonces échoue ; sans 0013, la génération d'annonces échoue (fonction `claim_listing_slot` absente) et le webhook Stripe ne crédite plus les packs (`grant_listing_credits` change de signature) ; sans 0012, les PDF et l'envoi de factures n'ont ni numéro ni identité d'émetteur (colonnes `reference` et `issuer_*` absentes) et les nouvelles factures ne sont plus numérotées. 0010 et 0011 peuvent attendre l'activation de la newsletter, mais rien n'interdit de les appliquer maintenant : tant que `NEWSLETTER_ENABLED` est vide, les tables restent vides.

Toutes sont additives : aucune ne supprime ni ne modifie de donnée existante.

## Marche à suivre (éditeur SQL de Supabase)

1. Faire une sauvegarde ou vérifier que celle du jour existe (Database > Backups).
2. Ouvrir **SQL Editor**, nouvelle requête. Coller le contenu de `0007_listing_variants.sql`, **Run**. Contrôle : « Success. No rows returned ».
3. Nouvelle requête pour **`0008_listing_platforms.sql` seule** (ne pas la regrouper avec d'autres fichiers) : elle ajoute des valeurs à un type énuméré. Run.
4. Même chose pour `0009_testimonials.sql`, puis `0010_newsletter.sql`, puis `0011_newsletter_campaigns.sql`, puis `0012_invoice_integrity.sql`, puis `0013_quota_ratelimit_billing.sql`, un fichier par requête. L'éditeur affiche un avertissement « destructive operations » pour 0012 (`drop policy`, `revoke`) : attendu, aucune donnée n'est supprimée.
5. Lancer les contrôles ci-dessous.

Variante en ligne de commande, si le projet est lié (`supabase link`) : `supabase db push` applique les fichiers manquants dans l'ordre.

Si une requête échoue : ne pas passer à la suivante, relever le message d'erreur exact et le transmettre. Une migration exécutée deux fois ne casse pas 0007 ni 0008 (`if not exists`) ; 0009, 0010 et 0011 échouent à la seconde exécution parce que les tables existent déjà, sans dommage.

## Contrôles après application

À exécuter dans le SQL Editor. Résultats attendus entre parenthèses.

```sql
-- 0007 : la colonne existe (1 ligne : variants, jsonb)
select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'listings' and column_name = 'variants';

-- 0008 : 23 valeurs au total (5 d'origine + 18 ajoutées), dont geev, trocservices, pap
select count(*) as valeurs,
       bool_or(enumlabel = 'geev') as geev, bool_or(enumlabel = 'trocservices') as trocservices, bool_or(enumlabel = 'pap') as pap
from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname = 'listing_platform';

-- 0009, 0010, 0011 : les tables existent et la RLS est activée (4 lignes, rls = true partout)
select relname, relrowsecurity as rls from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('testimonials', 'newsletter_subscribers', 'newsletter_campaigns', 'newsletter_deliveries')
order by relname;

-- 0010, 0011 : le public n'a aucun droit sur les tables de la newsletter (4 lignes, false partout)
select t.relname, has_table_privilege('anon', t.oid, 'select') as anon_select,
       has_table_privilege('authenticated', t.oid, 'insert') as authenticated_insert
from pg_class t where t.relnamespace = 'public'::regnamespace
  and t.relname in ('newsletter_subscribers', 'newsletter_campaigns', 'newsletter_deliveries');

-- 0012 : les factures existantes ont une référence et une identité d'émetteur (aucune ligne avec reference null)
select reference, number, issuer_name from public.invoices order by created_at;

-- 0012 : une seule politique de suppression (invoices_delete_own_quotes) et les deux déclencheurs
select policyname from pg_policies where schemaname = 'public' and tablename = 'invoices' and cmd = 'DELETE';
select tgname from pg_trigger where tgrelid = 'public.invoices'::regclass and not tgisinternal;

-- 0013 : tables et fonctions créées (2 tables ; 6 fonctions + grant_listing_credits à 3 arguments)
select relname, relrowsecurity as rls from pg_class where relnamespace = 'public'::regnamespace and relname in ('listing_reservations', 'rate_limits');
select proname, pronargs from pg_proc where pronamespace = 'public'::regnamespace
  and proname in ('claim_listing_slot','release_listing_slot','rate_limit_hit','revoke_listing_credits','mark_past_due','expire_past_due_subscriptions','grant_listing_credits')
order by proname, pronargs;

-- 0009 : politiques de la table testimonials (4 politiques : select_approved, select_own, insert_own, delete_own)
select policyname, cmd from pg_policies where schemaname = 'public' and tablename = 'testimonials' order by policyname;
```

Dans **Database > Advisors** (Security), aucun avertissement « RLS désactivée » ne doit apparaître pour ces quatre tables.

## Essais à faire après le déploiement

00. **0013** : générer une annonce (quota réservé puis rendu, `select count(*) from listing_reservations` doit revenir à 0 après la réponse) ; dans Stripe, ajouter `charge.refunded` et `charge.dispute.created` à la destination du webhook ; rembourser un achat de pack de test : les crédits restants disparaissent (`select remaining from listing_credit_grants`).
0. **0012** : créer une facture : son numéro est `F-AAAA-0001` (puis 0002, etc.) ; une seconde facture datée avant la première est refusée avec un message ; le PDF et l'e-mail portent le nom, le SIRET et l'adresse saisis à la création, même après modification du profil ; le bouton de suppression n'apparaît que sur les devis.

1. **T20 et T21** : connecté, générer une annonce multi-sites avec plusieurs plateformes (dont Geev et PAP) ; l'annonce apparaît dans la liste, une seule unité de quota est consommée.
2. **T24** : ouvrir la page Annonces du tableau de bord (elle doit s'afficher) ; envoyer un témoignage de test ; le retrouver en `pending` dans la table ; le retirer depuis la page.
3. **T25** (après activation) : s'inscrire à la newsletter avec une vraie adresse, vérifier la ligne `pending`, confirmer par le lien, vérifier `confirmed`, se désinscrire par le lien du message.

## Annulation

Les migrations sont additives, l'annulation se fait à la main et seulement si nécessaire :

- 0007 : `alter table public.listings drop column variants;` (perd les versions multi-sites déjà générées).
- 0009 : `drop table public.testimonials;` (perd les témoignages).
- 0010 et 0011 : `drop table public.newsletter_deliveries, public.newsletter_campaigns, public.newsletter_subscribers;` (perd les abonnés et l'historique d'envoi).
- 0012 : `drop trigger invoices_before_insert on public.invoices; drop trigger invoices_before_update on public.invoices; drop policy invoices_delete_own_quotes on public.invoices; create policy "invoices_delete_own" on public.invoices for delete using (auth.uid() = user_id); grant update on public.invoices to authenticated;` (les colonnes ajoutées peuvent rester ; les factures redeviennent modifiables et supprimables).
- 0013 : annulation à la main, après avoir remis le code précédent : `drop table public.listing_reservations, public.rate_limits;` `drop function public.claim_listing_slot(uuid,int,text), public.release_listing_slot(uuid), public.rate_limit_hit(text,int,int), public.revoke_listing_credits(text), public.mark_past_due(text), public.expire_past_due_subscriptions(int);` et recréer `grant_listing_credits(uuid,int)` depuis `0005`. Les colonnes ajoutées peuvent rester.
- 0008 : **non réversible** : PostgreSQL ne permet pas de retirer une valeur d'un type énuméré. Les valeurs ajoutées sont sans effet si elles ne sont pas utilisées.
