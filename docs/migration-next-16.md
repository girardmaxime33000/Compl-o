# Migration vers Next.js 16 : réalisée

Date de la migration : 2026-10-16 (mise en production). Motif : `npm audit` signalait `next` 14.2.35 (alerte critique : déni de service via l'optimiseur d'images et la désérialisation de requêtes) et `postcss` ; la correction passait par la version majeure 16.

## 1. État

- Fusionnée dans `main` par la [PR #4](https://github.com/girardmaxime33000/Compl-o/pull/4) (commit de fusion `b213f80`), déployée en production sur `compleo.work`.
- Versions : Next 14.2.35 → 16.4.2 (Turbopack par défaut), React 18.3.1 → 19.3.1, ESLint 8 → 9.39.5, `eslint-config-next` 16.4.2. Node du projet Vercel : 24.x (Next 16 exige 20.9 ou plus ; la CI utilise Node 22). `typescript` 6 et `vitest` 5 étaient déjà conformes.
- `npm audit --omit=dev` : plus d'alerte sur `next` ni `postcss`. Restent 8 alertes dans la chaîne de build de `tailwindcss` 3 (`braces`, `chokidar`, `fast-glob`, `micromatch`, `postcss-nested`, `postcss-selector-parser`) ; pas de correctif sans passer à Tailwind 4, chantier distinct (le job `audit` de la CI reste donc rouge, il est informatif).

## 2. Changements de code (36 fichiers)

| Sujet | Changement |
|---|---|
| `params` et `searchParams` asynchrones | Pages et routes d'API concernées passées en `async` (`await props.params`) : fiches activité, activité × ville, villes, guides, login, tableau de bord, factures (PDF et envoi) |
| `cookies()` asynchrone | `createClient()` (`src/lib/supabase/server.ts`) devient asynchrone ; les 15 appelants font `await createClient()` (actions, routes d'API, pages, `auth.ts`). Le client navigateur (`supabase/client.ts`) ne change pas |
| Images de partage | `params` des deux `opengraph-image.tsx` (activités, guides) devient une promesse |
| `middleware` → `proxy` | `src/middleware.ts` renommé `src/proxy.ts`, fonction `proxy`. Le helper `src/lib/supabase/middleware.ts` garde son nom |
| `next.config.mjs` | `experimental.serverComponentsExternalPackages` → `serverExternalPackages` ; `outputFileTracingIncludes` sorti de `experimental`. En-têtes de sécurité conservés |
| ESLint | `next lint` supprimé : `eslint.config.mjs` (config « flat »), script `lint` = `eslint .`, `.eslintrc.json` supprimé. Deux règles React Compiler nouvelles (`react-hooks/refs`, `react-hooks/immutability`) en avertissement : le compilateur n'est pas activé et les cas signalés sont volontaires (redirection externe vers Stripe via `window.location.href`) |
| Nettoyage | 6 imports inutilisés et un `any` de test signalés par la nouvelle config |
| `tsconfig.json` | `jsx: react-jsx` (réécrit automatiquement par Next 16) |

## 3. Vérifications

**Avant la fusion (Claude, CI et prévisualisation)**
- `npm run typecheck`, `npm run lint` (0 erreur, 8 avertissements), `npm test` (164 tests), `npm run build` (Turbopack) et tests Python du script Unsplash : verts sur l'état combiné (migration + `main`), mêmes commandes que la CI (`verify` verte).
- Site compilé avec de fausses clés Supabase : audit navigateur Chromium (17 pages × 2 largeurs, axe-core) à 0 défaut ; `/dashboard` redirige vers `/login?next=%2Fdashboard` ; `/api/track` rejette un événement serveur ; en-têtes de sécurité présents ; images de partage en `image/png`.
- Traçage de fichiers des routes PDF : `pdfkit`, `react-pdf` et polices standard présents dans les `.nft.json` des trois routes.
- Prévisualisation Vercel (projet Supabase de test `compleo-test`, migrations `0001` à `0006` appliquées et vérifiées : 8 tables, sécurité de lignes activée partout, déclencheur `on_auth_user_created`, 5 fonctions) : build Ready sans cache ; connexion par lien magique de bout en bout (retour sur la prévisualisation, session ouverte, `/dashboard`), réussie après correction de la « Site URL » et des « Redirect URLs » de Supabase.

**Après la fusion (propriétaire, en production)**
- `/api/health` (commit de fusion, `"env":"production"`), accueil, `/pricing`, connexion par lien magique avec un compte réel, PDF de simulation, Vercel > Logs (filtre Error) : tous contrôlés par le propriétaire, déclaré OK le 2026-10-16.

## 4. Non vérifié sous Next 16

Fonctionnent sur la base du code et d'avant la migration, mais n'ont pas été rejoués après :
1. Facture PDF et envoi d'une facture par e-mail.
2. Paiement Stripe (création de session, retour `?checkout=`, webhook et idempotence, portail client).
3. Génération d'annonce par IA avec quota.
4. Export et suppression de compte.
5. Cron `/api/cron/emails` et lien de désinscription.
6. Écriture des événements d'analytics en base.
7. OAuth Google ; Safari et Firefox ; Lighthouse.

À contrôler au prochain usage réel ou sur une prévisualisation (variables : `docs/preview-env-checklist.md`). Surveiller Vercel > Logs et les webhooks Stripe les jours suivant la mise en production.

## 5. Retour arrière

Vercel > Deployments > déploiement précédent sain (`35cb633`, dernier déploiement sous Next 14.2.35) > ⋯ > « Promote to Production » (instantané). La migration ne comporte aucune modification de base de données : un retour de code ne laisse aucune donnée incohérente.

## 6. Reprendre ou refaire une migration majeure

Méthode utilisée (valable pour la prochaine) : lire le guide livré avec le paquet (`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`) ; installer les nouvelles versions ; `npx @next/codemod@canary next-async-request-api .` (il ne rend pas `createClient()` asynchrone : il laisse un commentaire d'erreur à résoudre à la main) ; adapter les points du tableau de la section 2 ; rejouer typecheck, lint, tests, build ; tester sur une prévisualisation avec un projet Supabase et Stripe **de test** ; fusionner par PR vers `main` (CI `verify` obligatoire) ; contrôler la production et garder « Instant Rollback » à portée de main.
