# Migration vers Next.js 16 : état et préparation

Date : 2026-10-15. Pourquoi : `npm audit` signale `next` 14.2.35 (alerte critique : déni de service via l'optimiseur d'images et la désérialisation de requêtes) et `postcss` ; la correction passe par la version majeure 16.

## 1. État

La migration est faite et vérifiée en local, mais pas poussée : elle est dans le commit `39f6c5e`, sur la branche locale `local/next-16-migration` (basée sur `9f39be3`). La branche `claude/new-session-og6dhq` et la PR #3 restent sur Next 14.2.35. Pousser la migration sur une branche distincte demande votre accord (voir section 4).

Versions : Next 14.2.35 → 16.4.2 (Turbopack par défaut), React 18.3.1 → 19.3.1, ESLint 8 → 9.39.5, `eslint-config-next` 16.4.2. Node 22 utilisé en test (Next 16 exige 20.9 ou plus). `typescript` 6 et `vitest` 5 sont déjà conformes.

## 2. Changements de code (36 fichiers)

| Sujet | Changement |
|---|---|
| `params` et `searchParams` asynchrones | Pages et routes d'API concernées passées en `async` (`await props.params`) : fiches activité, activité × ville, villes, guides, login, tableau de bord, factures (PDF et envoi) |
| `cookies()` asynchrone | `createClient()` (`src/lib/supabase/server.ts`) devient asynchrone ; les 15 appelants font `await createClient()` (actions, routes d'API, pages, `auth.ts`). Le client navigateur (`supabase/client.ts`) ne change pas |
| Images de partage | `params` des deux `opengraph-image.tsx` (activités, guides) devient une promesse |
| `middleware` → `proxy` | `src/middleware.ts` renommé `src/proxy.ts`, fonction `proxy`. Le helper `src/lib/supabase/middleware.ts` garde son nom |
| `next.config.mjs` | `experimental.serverComponentsExternalPackages` → `serverExternalPackages` ; `outputFileTracingIncludes` sorti de `experimental`. En-têtes de sécurité conservés |
| ESLint | `next lint` supprimé : `eslint.config.mjs` (config « flat »), script `lint` = `eslint .`. `.eslintrc.json` supprimé. Deux règles React Compiler nouvelles (`react-hooks/refs`, `react-hooks/immutability`) en avertissement : le compilateur n'est pas activé et les cas signalés sont volontaires (redirection externe vers Stripe via `window.location.href`) |
| Nettoyage | 6 imports inutilisés et un `any` de test signalés par la nouvelle config |
| `tsconfig.json` | `jsx: react-jsx` (réécrit automatiquement par Next 16) |

## 3. Vérifications faites (sur la branche locale)

- `npm run typecheck` et `npm run build` (Turbopack) passent ; `npm run lint` : 0 erreur, 8 avertissements (redirections `window.location`, règles React Compiler) ; 162 tests Vitest passent.
- Site compilé (`next start`, fausses clés Supabase) : audit navigateur Chromium (17 pages × 2 largeurs, axe-core) à 0 défaut ; `/dashboard` redirige vers `/login?next=%2Fdashboard` (le proxy fonctionne) ; `/api/track` rejette un événement serveur ; en-têtes de sécurité présents ; images de partage des guides et activités répondent en `image/png`.
- Traçage de fichiers des routes PDF : les fichiers `pdfkit`, `react-pdf` et les polices standard figurent dans les `.nft.json` des trois routes (simulation, facture PDF, envoi de facture).
- `npm audit --omit=dev` : plus d'alerte sur `next` ni `postcss`. Restent 8 alertes dans la chaîne de build de `tailwindcss` 3 (`braces`, `chokidar`, `fast-glob`, `micromatch`, `postcss-nested`, `postcss-selector-parser`) : pas de correctif sans passer à Tailwind 4 (chantier distinct, à ne pas coupler).

## 4. Ce qui n'est PAS vérifié (la raison d'un déploiement de prévisualisation)

Impossible ici faute de Supabase, Stripe, fournisseur d'e-mail et d'IA réels :

1. Connexion complète : lien magique, OAuth Google, retour `/auth/callback`, cookies de session (changement le plus risqué : `cookies()` asynchrone et proxy).
2. Génération réelle de PDF (simulation, facture) et envoi de facture par e-mail : le traçage est correct, mais aucun PDF n'a été produit sous Turbopack.
3. Paiement Stripe : création de session, retour `?checkout=`, webhook (`checkout.session.completed`, idempotence), portail client.
4. Génération d'annonce par IA avec quota ; export du compte ; suppression du compte.
5. Cron des e-mails (`/api/cron/emails`) et lien de désinscription.
6. Événements d'analytics écrits en base (erreur « supabaseKey is required » attendue en test sans clé de service).
7. Comportement au clic dans un navigateur (diagnostic complet) ; Safari et Firefox ; Lighthouse.

## 5. Ce que vous devez préparer

1. **Accord de publication** : me dire si je pousse la migration sur une branche dédiée (par exemple `claude/next-16-migration`) avec une PR séparée de la PR #3. Je ne le fais pas sans votre accord. Ne pas la fusionner dans la PR #3 : une régression d'authentification ou de paiement serait difficile à isoler.
2. **Vercel** : vérifier que la version de Node du projet est 20.9 ou plus (22 recommandé), dans Settings > General > Node.js Version. Prévoir la prévisualisation de la branche (Vercel la crée automatiquement à la poussée).
3. **Environnement de test** (jamais la production) :
   - un projet Supabase de test (ou une branche) avec les migrations `0001` à `0006` appliquées, et ses trois clés (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) ;
   - les URL de redirection de la prévisualisation ajoutées dans Supabase (Authentication > URL Configuration) et, si OAuth Google est utilisé, dans la console Google ;
   - Stripe en **mode test** : clés de test, trois prix de test (`STRIPE_*_PRICE_ID`), un webhook de test vers l'URL de prévisualisation (ou Stripe CLI) avec son secret ;
   - un fournisseur d'e-mail en mode test et le secret du cron (`CRON_SECRET`) ;
   - la clé du fournisseur d'IA ;
   - variables d'environnement de prévisualisation renseignées dans Vercel (Settings > Environment Variables, cocher « Preview »).
4. **Jeu de tests à dérouler sur la prévisualisation** (30 minutes) : inscription par lien magique, connexion Google, déconnexion ; diagnostic ; génération d'annonce (jusqu'à la limite gratuite) ; achat d'un pack avec une carte de test Stripe, puis vérification des crédits ; création et téléchargement d'une facture PDF et d'un PDF de simulation ; envoi d'une facture par e-mail ; export puis suppression d'un compte de test ; déclenchement manuel du cron.
5. **Plan de retour** : conserver le déploiement de production actuel (Vercel permet de le promouvoir de nouveau en un clic) ; ne fusionner qu'après le jeu de tests ; fusionner en dehors des heures de pointe.
6. **Décisions** : fusion dans la base après validation ; maintien des deux règles React Compiler en avertissement (ou correction des redirections `window.location` en `window.location.assign`, sans effet fonctionnel) ; planification d'un passage à Tailwind 4 pour les 8 alertes restantes.

## 6. Reproduire ou reprendre la migration

```bash
git worktree list                       # worktree de la migration (dossier de scratchpad de la session)
git log local/next-16-migration -1      # 39f6c5e
```

Ou, à partir de `9f39be3`, rejouer : `npm i next@16 react@19 react-dom@19 eslint@9 eslint-config-next@16`, `npx @next/codemod@canary next-async-request-api .`, puis les changements du tableau de la section 2 (le codemod ne rend pas `createClient()` asynchrone : il laisse un commentaire d'erreur à résoudre à la main).
