# Checklist des variables d'environnement Preview

Date : 2026-10-15, mise à jour le 2026-10-16 après le premier usage réel (migration Next 16, PR #4). Liste établie à partir du code (`process.env.*` dans `src/`), de `.env.example` et de `vercel.json`. Aucune valeur secrète n'est écrite ici.

Adresse de prévisualisation stable d'une branche : `https://compl-o-git-<branche, « / » remplacé par « - »>-maxime33s-projects.vercel.app` (exemple pour la branche `claude/next-16-migration` : `https://compl-o-git-claude-next-16-migration-maxime33s-projects.vercel.app`).

## 0. Règles à respecter

- **Jamais de clé de production dans « Preview »** : projet Supabase de test, Stripe en mode test (clés `sk_test_…`, prix de test), jeu de données jetable.
- Dans Vercel : Settings > Environment Variables > Add. Cocher uniquement **Preview**. Pour limiter la portée, choisir la branche `claude/next-16-migration` (liste déroulante à côté de Preview), afin de ne pas affecter les autres prévisualisations.
- Marquer les secrets comme **Sensitive** (clé de service Supabase, clé secrète et secret de webhook Stripe, clés IA, e-mail, `CRON_SECRET`).
- `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais prendre le préfixe `NEXT_PUBLIC_` (visible par le navigateur).
- Les variables `NEXT_PUBLIC_*` sont figées **à la construction** : après toute modification, redéployer (Deployments > ⋯ > Redeploy, sans réutiliser le cache de construction).

## 1. Variables à renseigner

Colonne « Sans elle » : ce qui casse si la variable manque (d'après le code).

### Site

| ☐ | Variable | Requise | Valeur Preview | Sans elle |
|---|---|---|---|---|
| ☐ | `NEXT_PUBLIC_SITE_URL` | Oui | l'adresse de prévisualisation ci-dessus, sans `/` final | Retombe sur `http://localhost:3000` : les retours de paiement Stripe (`success_url`, `cancel_url`, retour du portail), les liens d'e-mail, les URL canoniques et le sitemap pointent vers localhost |

### Supabase (projet de test)

| ☐ | Variable | Requise | Où la trouver | Sans elle |
|---|---|---|---|---|
| ☐ | `NEXT_PUBLIC_SUPABASE_URL` | Oui | Supabase > Project Settings > API > Project URL | Le proxy (ex-middleware) et toutes les pages qui lisent la session plantent |
| ☐ | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | idem, clé `anon` | idem |
| ☐ | `SUPABASE_SERVICE_ROLE_KEY` | Oui (Sensitive) | idem, clé `service_role` | Échec du webhook Stripe, des crédits, de l'analytics, du cron et de la suppression de compte (client administrateur) |

Préparation côté Supabase (hors Vercel) :

- ☐ Migrations `0001` à `0006` (`supabase/migrations/`) appliquées dans l'ordre.
- ☐ Authentication > URL Configuration : ajouter l'adresse de prévisualisation (et `/auth/callback`) aux « Redirect URLs ». La connexion utilise `window.location.origin` : sans cette entrée, le lien magique et Google reviennent vers la mauvaise adresse ou sont refusés.
- ☐ Si OAuth Google est utilisé : ajouter l'URL de rappel de Supabase dans la console Google et activer le fournisseur dans le projet de test.

### Stripe (mode test)

| ☐ | Variable | Requise | Où la trouver | Sans elle |
|---|---|---|---|---|
| ☐ | `STRIPE_SECRET_KEY` | Oui (Sensitive) | Stripe (mode test) > Développeurs > Clés API, `sk_test_…` | Paiement indisponible |
| ☐ | `STRIPE_WEBHOOK_SECRET` | Oui (Sensitive) | Stripe > Développeurs > Webhooks > votre point de terminaison > Secret de signature, `whsec_…` | Webhook refusé : aucun crédit ni abonnement n'est activé |
| ☐ | `STRIPE_PACK_PRICE_ID` | Oui | Stripe > Catalogue de produits, prix du pack en mode test, `price_…` | Offre « pack » non vendable |
| ☐ | `STRIPE_MONTHLY_PRICE_ID` | Oui | idem, prix mensuel | Offre mensuelle non vendable |
| ☐ | `STRIPE_ANNUAL_PRICE_ID` | Oui | idem, prix annuel | Offre annuelle non vendable |

Préparation côté Stripe :

- ☐ Trois prix de **test** aux montants affichés dans `src/lib/offers.ts` (pack ponctuel, mensuel, annuel).
- ☐ Point de terminaison de webhook de test : `<adresse de prévisualisation>/api/webhooks/stripe`, événements `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.*` (liste du README).
- ☐ Portail client activé en mode test (Paramètres > Facturation > Portail client), sinon `/api/stripe/portal` échoue.
- ☐ Attention à la protection Vercel : si « Vercel Authentication » protège les prévisualisations, Stripe recevra une page de connexion à la place du webhook. Dans Vercel > Settings > Deployment Protection, soit désactiver la protection pour Preview le temps du test, soit utiliser « Protection Bypass for Automation » (le secret se passe en paramètre de requête `x-vercel-protection-bypass=…` dans l'URL du webhook). À valider dans l'interface Vercel avant de compter sur le webhook.

### Fournisseur d'IA

`AI_PROVIDER` vaut `openai-compatible` par défaut.

| ☐ | Variable | Requise | Valeur | Sans elle |
|---|---|---|---|---|
| ☐ | `AI_PROVIDER` | Non | `openai-compatible` (défaut), `openai` ou `anthropic` | Défaut utilisé |
| ☐ | `AI_BASE_URL` | Oui avec `openai-compatible` | Une API accessible depuis Vercel (p. ex. Groq `https://api.groq.com/openai/v1`, OpenRouter `https://openrouter.ai/api/v1`). Pas `localhost` | Erreur « AI_BASE_URL et AI_MODEL sont requis » : aucune annonce générée |
| ☐ | `AI_MODEL` | Oui | Nom du modèle chez le fournisseur choisi | idem |
| ☐ | `AI_API_KEY` | Selon le fournisseur (Sensitive) | Clé du fournisseur | Appel refusé |
| ☐ | `OPENAI_API_KEY` | Seulement si `AI_PROVIDER=openai` (Sensitive) | | |
| ☐ | `ANTHROPIC_API_KEY` | Seulement si `AI_PROVIDER=anthropic` (Sensitive) | | |

Le choix du fournisseur de production est une décision du propriétaire (CLAUDE.md, tâche T03) : pour la prévisualisation, prendre le plus simple.

### E-mail et cron

| ☐ | Variable | Requise | Valeur | Sans elle |
|---|---|---|---|---|
| ☐ | `RESEND_API_KEY` | Pour tester l'envoi (Sensitive) | Resend > API Keys (clé de test) | Envoi désactivé proprement (`isEmailConfigured` faux) : envoi de facture et séquence d'e-mails non testables |
| ☐ | `EMAIL_FROM` | Avec la clé Resend | `Compléo <adresse@domaine-vérifié>` ; domaine vérifié dans Resend (ou l'adresse de test que Resend autorise) | idem |
| ☐ | `CRON_SECRET` | Oui (Sensitive) | Chaîne aléatoire de 32 caractères ou plus, générée pour l'occasion | La route `/api/cron/emails` refuse tout appel ; sert aussi de secret des liens de désinscription |
| ☐ | `EMAIL_UNSUBSCRIBE_SECRET` | Non | Par défaut `CRON_SECRET` | Défaut utilisé |

Le cron de `vercel.json` (`0 8 * * *`) ne s'exécute **que sur le déploiement de production**, pas sur une prévisualisation : pour le tester, appeler la route à la main avec l'en-tête `Authorization: Bearer <CRON_SECRET>` (méthode GET).

### Variable à ne PAS mettre dans Vercel

- `UNSPLASH_ACCESS_KEY` : utilisée uniquement par le script de sélection des photos, sur votre poste. Inutile au site.

## 2. Après la saisie

1. ☐ Redéployer la branche (voir règle ci-dessus), attendre « Ready ».
2. ☐ Ouvrir l'adresse de prévisualisation : accueil, `/activites`, `/guides` s'affichent sans erreur (pages statiques, ne dépendent pas des clés).
3. ☐ `/login` : demande de lien magique, puis clic sur le lien reçu : retour sur la prévisualisation, session ouverte.
4. ☐ `/pricing` puis achat d'un pack avec la carte de test Stripe `4242 4242 4242 4242` (date future, CVC quelconque) : retour sur la prévisualisation (et non localhost), crédits ajoutés (webhook reçu : visible dans Stripe > Webhooks > Tentatives).
5. ☐ Génération d'une annonce depuis `/dashboard/listings`.
6. ☐ Facture PDF et PDF de simulation téléchargés et lisibles ; envoi d'une facture par e-mail.
7. ☐ Appel manuel du cron avec le secret : réponse 200.
8. ☐ Export puis suppression d'un compte de test.
9. ☐ Après les tests : désactiver ou supprimer le webhook de test, révoquer les clés de test si elles ont été partagées, retirer les variables Preview qui ne servent plus.

## 3. Pièges connus

- **Valeur de `NEXT_PUBLIC_SITE_URL` oubliée ou périmée** : symptôme typique, un paiement test qui renvoie vers `localhost:3000`.
- **Clés de production dans Preview** : un paiement ou un e-mail réel partirait depuis une prévisualisation. Vérifier le préfixe `sk_test_` et l'URL du projet Supabase.
- **Webhook sans secret correspondant** : un secret `whsec_…` change à chaque point de terminaison Stripe ; en créer un nouveau impose de mettre à jour la variable puis de redéployer.
- **Protection de déploiement Vercel** : bloque les appels extérieurs (webhook Stripe, cron appelé depuis l'extérieur) sans contournement.
- **Variables ajoutées sans redéploiement** : les valeurs `NEXT_PUBLIC_*` et celles lues au démarrage ne sont prises en compte qu'au prochain déploiement.

## 4. Retour d'expérience (premier usage, 2026-10-16)

- **Lien magique renvoyé vers `localhost:3000`** : cause constatée, la « Site URL » du projet Supabase de test était restée sur la valeur par défaut `http://localhost:3000` et l'adresse de prévisualisation n'était pas dans les « Redirect URLs ». Corrigé en réglant les deux (Authentication > URL Configuration, adresse suivie de `/**` pour les Redirect URLs), puis en redemandant un lien (l'ancien code est à usage unique).
- **Type des variables dans Vercel** : « Config » pour `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (valeurs publiques, relisibles après enregistrement, ce qui aide à vérifier l'absence de `/` final) ; « Secret » pour `SUPABASE_SERVICE_ROLE_KEY` et tout secret. Vercel affiche un avertissement « Keep This Value Private » sur les variables `NEXT_PUBLIC_` : générique, à ignorer pour elles.
- **Portée des variables** : à l'ajout, choisir l'environnement « Preview » puis cocher la branche voulue ; revenir en arrière avec la flèche `<` pour changer d'environnement. Contrôler ensuite que les variables de production (Stripe, Resend, `CRON_SECRET`) n'affichent que « Production », jamais « All Environments ».
- **Redéploiement** : après tout ajout de variable, Redeploy de la ligne de la **branche concernée** (pas celle d'une autre branche), « Use existing Build Cache » décoché ; la fenêtre rappelle que le nouveau déploiement utilise les derniers réglages du projet.
- **Protection de déploiement** : « Vercel Authentication » (Standard Protection) était active : la prévisualisation exige d'être connecté à Vercel, sans effet sur le domaine de production.
- **Envoi d'e-mails de Supabase** : limité à quelques messages par heure avec l'envoi par défaut ; ne pas enchaîner les essais.
