# Compléo

**Complément de salaire : activités et services près de chez vous.**

Compléo est une application web (SaaS B2C) qui aide les particuliers urbains en France à rendre service près de chez eux et à en tirer un complément de revenu (estimation selon profil, ville et temps disponible, sans garantie) grâce à une micro-activité : choisir une activité adaptée à son profil, rédiger ses annonces avec une IA, estimer ce qu'il reste après cotisations et émettre ses devis et factures.

> Statut : en production sur https://compleo.work (connexion, diagnostic, annonces IA, simulateur, facturation PDF, paiement Stripe, pages SEO activités et villes). Quatre offres : Gratuit, Pack ponctuel 4,99 €, Pack mensuel 6,99 € et Abonnement annuel 69,99 € (voir [Offres](#offres)).

---

## Sommaire

1. [Le problème et l'objectif](#le-problème-et-lobjectif)
2. [Public visé](#public-visé)
3. [Fonctionnalités](#fonctionnalités)
4. [Offres](#offres)
5. [Stack technique](#stack-technique)
6. [Architecture](#architecture)
7. [Modèle de données](#modèle-de-données)
8. [Installation](#installation)
9. [Variables d'environnement](#variables-denvironnement)
10. [Configuration des services](#configuration-des-services)
11. [Scripts](#scripts)
12. [Sécurité](#sécurité)
13. [Limites connues et avertissements](#limites-connues-et-avertissements)
14. [Feuille de route](#feuille-de-route)

---

## Le problème et l'objectif

Beaucoup de particuliers veulent arrondir leurs fins de mois mais se heurtent à trois obstacles :

- **Quoi faire ?** Ils ne savent pas quelle activité correspond à leurs compétences, à leur matériel et au temps dont ils disposent.
- **Comment se faire connaître ?** Rédiger une annonce efficace sur LeBonCoin, AlloVoisins ou GensDeConfiance n'est pas évident.
- **Quel impact financier ?** Cotisations URSSAF, plafonds de TVA et de chiffre d'affaires, cumul avec le chômage : les règles sont opaques, et la facturation conforme intimide.

**Objectif de Compléo** : accompagner l'utilisateur de l'idée à la première facture, en quatre étapes guidées, avec des outils simples, en français, pensés d'abord pour le mobile.

## Public visé

- Salariés, étudiants, retraités ou demandeurs d'emploi qui souhaitent démarrer une micro-activité de services de proximité.
- Personnes qui débutent en micro-entreprise (régime micro-entrepreneur) et veulent comprendre leurs charges avant de se lancer.

## Fonctionnalités

### 1. Diagnostic et recommandation d'activités (`/onboarding`)

Formulaire en trois étapes : domaines qui plaisent, matériel disponible, temps disponible par semaine. Un algorithme de correspondance (`src/lib/activities.ts`) classe un catalogue d'activités (bricolage, soutien scolaire, cours de langue, livraison, garde d'animaux, ménage, jardinage, aide informatique, dépôt-vente) et renvoie **3 recommandations** avec :

- le service recommandé et son pitch ;
- le tarif moyen pratiqué en France (par exemple 20 € à 35 €/h) ;
- les plateformes où trouver des clients ;
- une estimation de revenu mensuel selon le temps disponible (60 % du temps considéré comme facturable) ;
- le matériel manquant le cas échéant.

### 2. Générateur d'annonces par IA (`/dashboard/listings`)

À partir du service, de la ville, des compétences et des plateformes choisies (21 sites répartis en 6 groupes : services, vie de quartier, transport, animaux, colis et stockage, troc et don ; jusqu'à 5 par génération), l'IA produit, pour chaque site, un titre optimisé, un texte structuré (avantages, compétences, tarifs, appel à l'action) et 3 hashtags. Chaque annonce est enregistrée en base et copiable en un clic.

L'offre gratuite est limitée à **2 annonces par mois** ; la limite est appliquée côté serveur.

### 3. Simulateur « Net dans la poche » (`/dashboard/simulator`)

Calcul en temps réel pour une prestation de services en micro-entreprise :

- cotisations URSSAF (BNC non réglementé 25,6 %, services BIC 21,2 %, valeurs 2026) et net avant impôts, mensuel et annuel ;
- alertes visuelles sur le **seuil de franchise de TVA** (37 500 € en services, valeur 2026) et le **plafond micro-entrepreneur** (83 600 € en prestations, 203 100 € en vente, valeurs 2026) ;
- option de cumul avec le **chômage (ARE / France Travail)** : estimation de la réduction de l'allocation et du total mensuel.

### 4. Facturation simplifiée (`/dashboard/invoices`)

Création de devis et de factures sans TVA avec la mention « TVA non applicable, art. 293 B du CGI », numérotation automatique, suivi du statut (brouillon, envoyé, payé) et **téléchargement en PDF**.

### 5. Abonnement Premium (`/pricing`)

Paiement par Stripe Checkout (acceptation des CGU/CGV et renonciation à la rétractation validées côté serveur avant création de la session), gestion de l'abonnement (moyen de paiement, résiliation) via le portail client Stripe, et mise à jour automatique du statut par webhook.

## Offres

| | Gratuit | Pack ponctuel | Pack mensuel | Annuel |
|---|---|---|---|---|
| Prix | 0 € | 4,99 € (une fois) | 6,99 € / mois | 69,99 € / an |
| Annonces IA | 2 par mois | 4 annonces créditées, valables 12 mois | 10 par jour | Illimitées |
| Diagnostic, simulateur, devis et factures PDF | Oui | Oui | Oui | Oui |

Le quota du plan est consommé d'abord, puis les crédits du pack ponctuel. Les quotas sont appliqués côté serveur (`src/lib/quota.ts`, `/api/generate-listing`). Le quota journalier suit l'heure de Paris.

## Stack technique

| Domaine | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions, Turbopack), React 19 |
| Langage | TypeScript (mode strict) |
| Interface | Tailwind CSS, composants de style shadcn/ui (Radix UI), `lucide-react` |
| Base de données et authentification | Supabase (PostgreSQL, Row Level Security, lien magique et Google) |
| Paiements | Stripe (Checkout, Billing, portail client, webhooks) |
| IA | Vercel AI SDK, par défaut un modèle open source via une API compatible OpenAI (Ollama en local, Groq en production). OpenAI et Anthropic sont également supportés. |
| PDF | `@react-pdf/renderer` |
| Validation | Zod |

## Architecture

```
src/
├── app/
│   ├── page.tsx                  Page d'accueil
│   ├── login/                    Connexion (lien magique, Google)
│   ├── auth/callback/            Échange du code d'authentification
│   ├── onboarding/               Diagnostic en 3 étapes
│   ├── pricing/                  Offres et paiement
│   ├── simulateur-micro-entrepreneur/ Simulateur public (sans compte)
│   ├── modele-facture-auto-entrepreneur/ Aperçu public de facture (PDF après inscription)
│   ├── generateur-annonce/       Démo publique d'annonces pré-rédigées (aucun appel IA anonyme)
│   ├── sitemap.ts robots.ts opengraph-image.tsx  SEO : sitemap (lastmod réel), robots (bots d'IA), image Open Graph
│   ├── activites/ activites/[slug]/  Pages activité publiques (une par activité du catalogue)
│   ├── activites/[slug]/[ville]/ Pages activité × ville (20 villes, SSG, seulement avec donnée locale, FAQ et FAQPage)
│   ├── villes/[ville]/           Hub d'une ville : activités avec donnée locale (maillage du footer)
│   ├── dashboard/account/        Mon compte : export JSON et suppression du compte (RGPD)
│   ├── api/simulation/pdf/       Export PDF d'une simulation (compte requis, résultat recalculé côté serveur)
│   ├── guides/ guides/[slug]/    Guides éditoriaux (contenu dans src/content/guides, registre src/lib/guides.ts)
│   ├── mentions-legales/         Mentions légales
│   ├── cgu/ cgv/ confidentialite/ CGU, CGV, politique de confidentialité (brouillons à faire relire)
│   ├── dashboard/                Espace connecté
│   │   ├── listings/             Générateur d'annonces
│   │   ├── simulator/            Net dans la poche
│   │   └── invoices/             Devis et factures
│   ├── actions/                  Server Actions (onboarding, factures, déconnexion)
│   └── api/
│       ├── generate-listing/     Génération d'annonce par IA (quota Freemium)
│       ├── invoices/[id]/pdf/    Génération du PDF
│       ├── stripe/checkout|portal/
│       └── webhooks/stripe/      Synchronisation de l'abonnement
├── components/                   Composants UI et composants par fonctionnalité
├── lib/
│   ├── activities.ts             Catalogue et algorithme de correspondance
│   ├── seo/                      Métadonnées, sitemap, builders JSON-LD (jsonld.ts) et contenus de FAQ (faq.ts)
│   ├── tax.ts                    Taux, plafonds et calculs fiscaux
│   ├── ai.ts                     Sélection du fournisseur d'IA
│   ├── platforms.ts              Plateformes et quota gratuit
│   ├── legal.ts                  Informations légales de l'éditeur
│   ├── stripe/ supabase/         Clients serveur, navigateur, admin, proxy
│   └── auth.ts                   Accès utilisateur et redirections sûres
├── proxy.ts                      Rafraîchissement de session et routes protégées (ex-middleware)
└── types/database.ts             Types des tables
supabase/migrations/              Schéma SQL
```

Principes :

- La route `/dashboard` est protégée par le proxy (`src/proxy.ts`, ex-middleware) ; `/onboarding` est publique (recommandations affichées sans compte, enregistrées après connexion).
- Les quotas et les droits (Premium) sont vérifiés **côté serveur**, jamais uniquement dans l'interface.
- La logique métier (fiscalité, recommandations) est isolée dans `src/lib`, en fonctions pures faciles à tester.

## Modèle de données

Quatre tables, toutes protégées par Row Level Security (chaque utilisateur n'accède qu'à ses propres lignes) :

- `profiles` : identité, `stripe_customer_id`, `subscription_status` (`free`, `active`, `canceled`), `subscription_plan` (`monthly`, `annual`), `subscription_plan` déjà cité ; les crédits du pack ponctuel sont dans `listing_credit_grants` (un lot par achat, expiration à 12 mois, consommation du lot le plus proche de l'expiration), SIRET et adresse de l'émetteur. Créé automatiquement à l'inscription par un trigger.
- `user_skills` : catégorie d'activité, matériel disponible, heures hebdomadaires.
- `listings` : annonces générées (titre, plateforme, texte, tarif suggéré).
- `invoices` : devis et factures (client, montant, statut, date, description, type).

Scripts : `supabase/migrations/0001_init.sql` puis `0002_invoice_details.sql`.

## Installation

Prérequis : Node.js 20 ou plus, un projet Supabase, un compte Stripe (mode test), un fournisseur d'IA.

```bash
git clone https://github.com/girardmaxime33000/Compl-o.git
cd Compl-o
npm install
cp .env.example .env.local   # puis renseigner les variables
npm run dev                  # http://localhost:3000
```

Après chaque `git pull` qui modifie `package.json`, relancer `npm install`.

## Variables d'environnement

Elles se renseignent uniquement dans `.env.local` (ignoré par git) et dans les variables d'environnement de l'hébergeur. Ne jamais les commiter ni les partager.

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (retours Stripe, redirections) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (publishable) Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé secrète Supabase : serveur uniquement, contourne la RLS |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `NEWSLETTER_ENABLED` | `true` : affiche le formulaire d'inscription du blog et ouvre `/api/newsletter/subscribe`. Vide par défaut. À activer seulement après relecture juridique de la politique de confidentialité et du texte de consentement. Valeur lue au build : redéployer après changement |
| `RESEND_API_KEY`, `EMAIL_FROM` | Envoi d'e-mails via Resend (documents, séquence d'accueil, alertes). `EMAIL_FROM` : adresse d'un domaine vérifié dans Resend. Sans ces variables, l'envoi est désactivé (503) |
| `CRON_SECRET` | Secret du cron quotidien `/api/cron/emails` (envoyé par Vercel en `Authorization: Bearer`) et des liens de désinscription |
| `EMAIL_UNSUBSCRIBE_SECRET` | Optionnel : secret dédié aux liens de désinscription (défaut : `CRON_SECRET`) |
| `STRIPE_PACK_PRICE_ID` | Prix du pack ponctuel (paiement unique, 4 annonces) |
| `STRIPE_MONTHLY_PRICE_ID` | Prix du pack mensuel (abonnement, 10 annonces/jour) |
| `STRIPE_ANNUAL_PRICE_ID` | Prix de l'abonnement annuel (annonces illimitées) |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature du webhook (`whsec_...`) |
| `AI_PROVIDER` | `openai-compatible` (défaut), `openai` ou `anthropic` |
| `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY` | Fournisseur compatible OpenAI (Ollama, Groq, OpenRouter) |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | Si l'un de ces deux fournisseurs est choisi |

## Configuration des services

### Supabase

1. Dans le `SQL Editor`, exécuter `0001_init.sql` puis `0002_invoice_details.sql`.
2. `Authentication` > `URL Configuration` : `Site URL` et `Redirect URLs` avec `<SITE_URL>/auth/callback`.
3. `Authentication` > `Providers` : activer l'e-mail (lien magique) et Google si souhaité.
4. `Project Settings` > `API Keys` : copier la clé publishable et la clé secrète.

### Stripe (mode test)

1. Créer trois prix Stripe et reporter leurs `price_...` dans les variables ci-dessus : pack ponctuel (4,99 €, paiement unique), pack mensuel (6,99 € par mois), abonnement annuel (69,99 € par an). Les montants affichés sont dans `src/lib/offers.ts` et doivent rester identiques à Stripe. Appliquer dans l'ordre les migrations `0003_offers_credits.sql` puis `0005_credit_expiry.sql` (et `0004_analytics_events.sql`). Dans le webhook Stripe, activer `checkout.session.completed`, `checkout.session.async_payment_succeeded` et `customer.subscription.*`.
2. Activer et enregistrer le portail client : `Settings` > `Billing` > `Customer portal`.
3. En local, rediriger les webhooks avec la CLI Stripe :
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   et reporter le secret `whsec_...` affiché.
4. Événements traités : `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
5. Carte de test : `4242 4242 4242 4242`, date future, CVC quelconque.

### IA

- **Ollama (local, gratuit)** : `ollama pull llama3.1:8b`, `AI_BASE_URL=http://localhost:11434/v1`, `AI_MODEL=llama3.1:8b`.
- **Groq (hébergé, palier gratuit)** : `AI_BASE_URL=https://api.groq.com/openai/v1`, `AI_MODEL=openai/gpt-oss-120b`, `AI_API_KEY` créé sur la console Groq.

Ollama ne fonctionne pas sur un hébergement type Vercel : en production, utiliser un fournisseur hébergé.

## Scripts

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Tests unitaires (Vitest) : `tax.ts`, catalogue d'activités, quotas d'annonces, webhook Stripe |

## Catalogue des activités urbaines

Segment `URBAN`, ajouté sans modifier le catalogue `src/lib/activities.ts` (les 10 fiches existantes n'ont aucun champ nouveau). Il n'existe pas de table d'activités en base : le catalogue est du code, donc aucune migration SQL n'est nécessaire et aucun schéma parallèle n'a été créé. Les 7 fiches (« seed ») sont dans `src/lib/urban-activities.ts` : 4 `PUBLISHED` (publiques) et 3 `EMERGING` (jamais exposées : pages, sitemap et llms.txt passent par `publishedUrbanActivities()`). Il n'y a pas d'écran d'administration : les pistes `EMERGING` se consultent dans le code (`emergingUrbanActivities()`).

**Schéma** (`UrbanActivity`) : `slug`, `name`, `status`, `segment`, `pitch`, `painPoints`, `pricing` (`PriceLine`), `effectiveHourlyRate` et `monthlyOperatingCosts` par profil, `revenueOverride` (CA composite par profil), `taxCategory`, `taxCategoryToConfirm`, `cfpCategory`, `sapEligibility`, `equipment`, `entryBarrier`, `skills`, `certifications`, `regulatoryNotes`, `risks`, `acquisitionChannels`, `adTemplate`, `adTemplateVariables`, `adVariableDefaults` (valeur par défaut des variables tarifaires, lue dans `pricing`), `capacityNote`. Les champs absents des fiches `EMERGING` sont optionnels ; le calcul de revenu et le rendu d'annonce lèvent une erreur sur une fiche incomplète.

**Règles** (`src/lib/urban-income.ts`) :
- R1 `computeMonthlyNetIncome(activity, profile, { acre?, year? })` : heures facturées = heures par semaine du profil × 4,33 ; CA = heures × taux horaire effectif (ou `revenueOverride`) ; cotisations = CA × (taux social de la catégorie + taux de formation professionnelle) ; net = CA − cotisations − charges d'exploitation. Le résultat garde la précision (`netIncome`) et fournit l'arrondi à la dizaine (`netDisplay`). ACRE : le coefficient (50 % avant le 1er juillet 2026, 75 % à partir de cette date, selon la date de début d'activité) s'applique aux cotisations sociales, pas à la contribution formation.
- R2 `vatAlert(selections)` : alerte quand le CA annuel de services (BIC services et BNC, cumulé sur toutes les activités choisies) atteint 90 % du seuil de franchise de TVA.
- R3 `hasSapConflict(activities)` : une activité éligible SAP combinée à une non éligible affiche `SAP_CONFLICT_MESSAGE` et retire les segments `{{sap}}…{{/sap}}` des annonces.
- R4 `cmaNotice(activity)` : message CMA, uniquement pour `reparation-velo-trottinette-domicile`.
- R5 `renderAd(activity, { values, sapDeclared, selection })` : variables entre crochets ; `prix_net_sap` = `prix_horaire` × (1 − taux du crédit d'impôt) ; longueur cible 250 à 320 caractères (`AD_LENGTH`), vérifiée par les tests avec un quartier de 12 caractères.
- R6 : statut `EMERGING`, voir ci-dessus.

**Interface** : la fiche `/activites/<slug>` (`src/components/activities/urban-sheet.tsx`) affiche tarifs, net par profil, matériel, réglementation, risques, canaux et annonce, en listes empilées sous 640 px. Le bloc « Combiner plusieurs activités » (`urban-planner.tsx`) applique R1 à R5 sur la sélection. Il n'existe pas encore d'étape « immatriculation » dans le parcours : l'alerte R3 et le message R4 sont affichés sur la fiche et dans ce bloc.

**Paramètres fiscaux** : `FISCAL_PARAMS_BY_YEAR` dans `src/lib/tax.ts`, une entrée par année ; les taux déjà présents dans `TAX_PARAMS` y sont repris, rien n'est dupliqué. Les valeurs de cotisation formation, d'ACRE et de crédit d'impôt SAP (taux, plafonds par sous-activité) viennent du propriétaire et ne sont pas encore rapprochées d'une fiche officielle.

**Mise à jour annuelle** : (1) relire les fiches officielles listées en tête de `tax.ts` (urssaf.fr, service-public.fr) ; (2) mettre à jour `TAX_PARAMS` ; (3) ajouter une entrée `FISCAL_PARAMS_BY_YEAR[<année>]` sans modifier l'année précédente ; (4) changer `CURRENT_FISCAL_YEAR` ; (5) mettre à jour les dates de vérification en commentaire ; (6) `npm test` : les tests R1 comparent aux valeurs attendues à ± 15 € et signalent un décalage. Les tarifs, coûts et heures facturées des fiches sont des repères indicatifs du propriétaire, à réviser avec les paramètres.

## Données locales (pages activité × ville)

`src/data/cities.json` est généré par `python3 scripts/build-city-data.py` (nécessite `openpyxl`) à partir de `data/raw/` : populations légales INSEE (20 plus grandes communes, Paris, Lyon et Marseille agrégées par arrondissements), « Dossier complet » INSEE (recensement 2023 et Filosofi, extrait par `scripts/extract-dossier-complet.py`) et enquête BMO de France Travail (2024 et 2025, par bassin d'emploi). Ne pas éditer le JSON à la main. Une page `/activites/[slug]/[ville]` n'est générée que si la ville a au moins un projet de recrutement dans les métiers rattachés à l'activité (voir `GROUPS` dans le script). Le millésime BMO 2026 et la base des équipements par commune ne sont pas utilisés (voir `TASKS.md`, T11).

**Régénérer les données** : (1) télécharger les fichiers listés dans `sources` de `src/data/cities.json` (INSEE populations légales : https://www.insee.fr/fr/statistiques/6683035 ; INSEE Dossier complet : https://www.insee.fr/fr/statistiques/5359146 ; France Travail BMO : https://statistiques.francetravail.org/bmo) dans `data/raw/` sous les noms attendus par `scripts/build-city-data.py` ; (2) `python3 scripts/extract-dossier-complet.py` si le Dossier complet change ; (3) `pip install openpyxl && python3 scripts/build-city-data.py`. Le script est déterministe : relancé sur les fichiers actuels, il reproduit le JSON à l'identique. La date de téléchargement (`downloadedOn`) est affichée sur chaque page ville et sert de `lastmod` au sitemap : la mettre à jour dans le script lors d'un nouveau téléchargement. Pour ajouter une ville, il faut une donnée locale réelle (population, Dossier complet, bassin BMO) ; une combinaison activité × ville sans projet de recrutement répond `404` et est absente du sitemap.

## Identité visuelle

Logo : symbole « C + » (un arc ouvert complété par un plus), bleu `#2563eb` (`BRAND_BLUE`), bleu nuit `#1e3a8a` pour les dégradés. Fourni par le propriétaire le 16 octobre 2026 (image générée par IA), reconstruit en SVG exact (recouvrement de 98,3 % avec l'image d'origine). Géométrie unique dans `src/lib/brand.ts` ; `public/logo/logo-mark.svg` (bleu) et `logo-mark-white.svg` (blanc) et `src/app/icon.svg` la reprennent, `src/lib/brand.test.ts` vérifie qu'ils restent identiques. Le nom « Compléo » s'écrit en texte (police Inter du site), pas dans l'image.

- Composant `LogoMark` (`src/components/brand/logo.tsx`) : en-tête public, page de connexion, en-tête du tableau de bord.
- Icône du site : `src/app/icon.svg` ; icône iOS : `src/app/apple-icon.tsx` (générée) ; symbole PNG pour les e-mails : route `/logo/mark.png` (générée, 192 × 192, fond transparent). Aucun fichier binaire n'est versionné.
- Cartes de partage (`src/lib/og.tsx`) : symbole blanc à côté du nom. E-mails (`src/lib/email-templates.ts`) : symbole et nom en tête. PDF de simulation : symbole vectoriel et nom en tête.
- Les PDF de factures et de devis restent volontairement neutres : ce sont les documents de l'utilisateur (voir T17).
- Non fait : version horizontale avec le nom, fichier favicon `.ico`, déclinaisons PNG versionnées. Droits : vérifier les conditions d'utilisation commerciale du générateur d'images utilisé et faire une recherche d'antériorité avant tout dépôt de marque.

## Photos (Unsplash)

Les photos sont sélectionnées à l'avance par `scripts/fetch-unsplash-images.py` et lues par le site dans deux fichiers JSON (aucun appel à l'API à l'exécution). Chaque emplacement sans photo garde son visuel généré.

| Périmètre | Emplacements | Fichier lu par le site | Sélection (à commiter) |
|---|---|---|---|
| `cities` (défaut) | une photo par ville (`/villes/[ville]`, `/activites/[slug]/[ville]`, tuiles de l'accueil) | `src/data/city-images.json` | `scripts/city-images-selection.json` |
| `site` | `hero:home`, `cta:final`, `login`, `activity:<id>`, `urban:<slug>`, `guide:<slug>` (23 emplacements) | `src/data/site-images.json` | `scripts/site-images-selection.json` |

Les requêtes de recherche du périmètre `site` sont dans `scripts/site-images-catalogue.json` (un test vérifie qu'il couvre exactement les activités, activités urbaines publiées et guides du code). Ajouter une activité ou un guide impose d'y ajouter sa ligne.

1. Créer une application sur https://unsplash.com/developers et copier l'Access Key (variable `UNSPLASH_ACCESS_KEY`, jamais dans le dépôt : elle ne sert qu'au script, pas au site).
2. `UNSPLASH_ACCESS_KEY=... python3 scripts/fetch-unsplash-images.py search site` (ou `cities`, ou `search site hero:home login` pour certaines clés) : recherche des candidats, écrit `data/unsplash/site-candidates.html` (planche de contact, ignorée par git) et un brouillon de sélection (première photo de chaque emplacement).
3. Ouvrir la planche, corriger le fichier de sélection (`{"hero:home": "<id Unsplash>"}`). Critères : photo lumineuse, personnes en situation de travail ou de service, aucune légende laissant croire à un client réel, pas de marque ou de visage identifiable dans un contexte sensible.
4. `python3 scripts/fetch-unsplash-images.py check site` : contrôle hors ligne de la sélection (clés connues, doublons signalés).
5. `UNSPLASH_ACCESS_KEY=... python3 scripts/fetch-unsplash-images.py build site` : déclare le téléchargement à Unsplash (obligation des directives de l'API, une fois par photo) et écrit le JSON. Les métadonnées (auteur, couleur moyenne) viennent des candidats : une requête par photo. Commiter le JSON et la sélection.
6. `python3 scripts/fetch-unsplash-images.py check site` : contrôle du JSON écrit (champs obligatoires, liens `images.unsplash.com`). `colors` ajoute la couleur moyenne aux anciennes entrées qui n'en ont pas.

Quota : le mode demo est limité à 50 requêtes par heure. Le périmètre `site` demande 23 requêtes de recherche, puis 23 de déclaration : lancer `search` et `build` à une heure d'écart. Le script s'arrête avant l'épuisement du quota et reprend là où il s'est arrêté (les entrées déjà écrites sont conservées). Le passage de l'application en mode production est à demander à Unsplash avant le lancement public.

Tests du script (API simulée, hors ligne) : `python3 -B -m unittest scripts/test_fetch_unsplash_images.py`.

Composants : `<Photo>` (`src/components/marketing/photo.tsx`) affiche n'importe quelle photo sélectionnée (ratio, `srcset`, crédit en légende ou en pastille, repli) ; `CityPhoto` l'utilise pour les villes. Tous les crédits sont listés sur `/credits-photos`.

Conformité aux directives de l'API : les images ne sont pas copiées dans le dépôt, elles sont servies par `images.unsplash.com` (hotlink), avec crédit du photographe et lien vers Unsplash portant `utm_source=compleo&utm_medium=referral`. Aucun appel à l'API à l'exécution, donc la limite de 50 requêtes par heure du mode demo ne concerne que le script. Vérifier les conditions Unsplash en vigueur avant la mise en ligne (passage en mode production si exigé).

## SEO

- **Sitemap** (`src/app/sitemap.ts`) : `lastmod` réel, sans `priority`. Pages ville et hubs ville : date de téléchargement des données ; guides : date de mise à jour du contenu (`updated` dans `src/lib/guides.ts`) ; pages statiques : date de build. Les pages légales sont en `noindex, follow` et absentes du sitemap.
- **Robots** (`src/app/robots.ts`) : `Allow: /` sur le contenu public, `Disallow` sur `/dashboard /login /auth /onboarding /api`. Les bots d'IA (GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended) ont une règle explicite identique à `*`. Pour les bloquer, retirer le bot de `AI_BOTS` dans `src/lib/seo/index.ts` et ajouter un `Disallow: /` dédié. Une page déjà crawlée se désindexe avec `robots: { index: false, follow: true }` (`NOINDEX`), jamais avec `Disallow`.
- **JSON-LD** : tous les builders sont dans `src/lib/seo/jsonld.ts` (fonctions pures ; `<` échappé à la sérialisation). `Organization` et `SoftwareApplication` (accueil), `BreadcrumbList` (pages publiques), `FAQPage` (accueil, tarifs, simulateur, hubs activité, pages activité × ville, et guides qui définissent un champ `faq`), `Article` (guides), `WebApplication` (simulateur). Les réponses des `FAQPage` sont celles affichées sur la page (`src/lib/seo/faq.ts`, `src/components/marketing/faq.tsx`).
- **llms.txt** (`src/app/llms.txt/route.ts`, contenu généré par `src/lib/seo/llms.ts`) : résumé du site, outils, guides, activités et villes pour les assistants d'IA (GEO), au format llmstxt.org. Les chiffres viennent de `tax.ts` et `offers.ts`, les listes du catalogue, des guides et des villes : rien à mettre à jour à la main. Il n'est pas déclaré dans `robots.txt` (le format ne le prévoit pas).
- **Tests** : `npm test` couvre les builders JSON-LD, le sitemap, robots, llms.txt, les FAQ, `tax.ts` et `activities.ts`.

## Blog

Routes : `/blog`, `/blog/[slug]`, `/blog/categorie/[cat]`, flux RSS `/blog/rss.xml`. Même modèle que les guides : chaque article est un composant dans `src/content/blog/` déclaré dans `BLOG_POSTS` (`src/lib/blog.ts`) avec titre, description (50 à 200 caractères), catégorie, dates, sources officielles et appel à l'action. Pas de MDX : les chiffres fiscaux sont importés de `tax.ts`. Signature : `BLOG_AUTHOR` (Maxime Girard, biographie et chemin de la page `/blog/auteur/maxime-girard`), nom cliquable dans chaque article, balisée `Person` dans le JSON-LD `Article` et sur la page auteur. La biographie est celle fournie par l'auteur ; la modifier dans `src/lib/blog.ts`. Catégories : `BLOG_CATEGORIES`.

**Règle de relecture (décision du propriétaire).** Un article n'est public qu'une fois relu : renseigner `reviewedOn` (date AAAA-MM-JJ de la relecture ciblée des chiffres, du juridique et des sources) dans `BLOG_POSTS`. Sans `reviewedOn`, l'article reste accessible par son URL mais en `noindex, follow`, et il est absent du sitemap, de `/blog`, des pages catégorie, du flux RSS, de `llms.txt` et des liens de navigation. Une catégorie sans article relu n'a pas de page (404) ; `/blog` est en `noindex` tant qu'aucun article n'est relu ; le lien « Blog » de l'en-tête et du pied de page n'apparaît qu'à partir du premier article relu.

Pour publier un article : créer le composant, l'ajouter à `BLOG_POSTS` (slug en minuscules, chiffres et tirets, 50 caractères maximum : le slug est la valeur de `article` dans la mesure), puis renseigner `reviewedOn` après relecture. `npm test` vérifie les slugs, les dates, les catégories, les sources, le sitemap et le flux RSS. Mesure : `blog_view` et `cta_click` portent le slug de l'article (voir « Mesure d'audience »).

### Newsletter du blog (capture d'e-mail)

Double opt-in, sans compte. Migration `0010_newsletter.sql` (table `newsletter_subscribers`, RLS activée, aucun droit pour `anon` et `authenticated` : service role uniquement). **Désactivée par défaut** : tant que `NEWSLETTER_ENABLED` n'est pas `true`, aucun formulaire n'est affiché et `/api/newsletter/subscribe` répond 503.

- **Parcours.** Formulaire en bas de chaque article et de `/blog` (`src/components/blog/newsletter-form.tsx`) : e-mail + case de consentement non cochée par défaut, validée aussi côté serveur (`consent` strictement `true`). `POST /api/newsletter/subscribe` crée une ligne `pending` et envoie un e-mail avec un lien de confirmation. `GET /api/newsletter/confirm?t=…` affiche un bouton (il n'enregistre rien : les messageries ouvrent souvent les liens) ; le clic envoie un `POST` qui passe la ligne en `confirmed` et enregistre `newsletter_confirmed`. `GET` ou `POST /api/newsletter/unsubscribe?s=…&t=…` désinscrit en un clic (lien signé HMAC, `List-Unsubscribe-Post` géré).
- **Preuve de consentement.** Date, version du texte (`NEWSLETTER_CONSENT_VERSION` dans `src/lib/newsletter-consent.ts`, à changer à chaque modification du texte) et origine (`blog` ou `blog:<slug>`). Ni adresse IP ni agent utilisateur. Le jeton de confirmation n'est jamais stocké (empreinte SHA-256).
- **Protection contre les abus.** Champ piège (honeypot), réponse identique que l'adresse existe ou non, délai de 10 minutes entre deux e-mails pour une même adresse en attente, 3 e-mails par 24 h et par adresse, 100 e-mails de confirmation par heure au total (429 au-delà), jeton valable 48 h, lignes `pending` de plus de 7 jours supprimées à chaque inscription. Pas de limitation par adresse IP (aucune IP n'est conservée).
- **Désinscrits.** La ligne reste avec le statut `unsubscribed` pour ne plus solliciter la personne ; suppression sur demande (adresse de contact de la politique de confidentialité). Une réinscription explicite repasse en `pending` avec une nouvelle confirmation.
- **Envoi des newsletters.** Migration `0011_newsletter_campaigns.sql` (tables `newsletter_campaigns` et `newsletter_deliveries`, service role uniquement). Route `POST /api/newsletter/send`, protégée par `Authorization: Bearer $NEWSLETTER_SEND_SECRET` (secret distinct de `CRON_SECRET`, 16 caractères minimum : sinon 401), pilotée par `scripts/send-newsletter.mjs`. Le message est une introduction facultative suivie d'une carte par article (titre, catégorie, résumé, lien) ; **seuls les articles relus (`reviewedOn`) sont acceptés**. Trois modes :
  1. `preview` : rendu du message et compteurs (abonnés confirmés, déjà servis, restants), rien n'est envoyé ni écrit.
  2. `test` : un seul message, préfixé `[TEST]`, à l'adresse `--to`, sans écriture en base. À faire avant le premier envoi réel : il valide aussi la clé Resend et l'endpoint d'envoi groupé.
  3. `send` : abonnés `confirmed` uniquement, par lots de 50 (`/emails/batch` de Resend), le script rappelle la route jusqu'à `remaining = 0`.
  
  ```bash
  export NEWSLETTER_SEND_SECRET=…   # jamais en argument de commande
  node scripts/send-newsletter.mjs --campaign 2026-11-a --subject "Objet" --posts slug-un,slug-deux --intro "Texte" --mode preview
  node scripts/send-newsletter.mjs --campaign 2026-11-a --subject "Objet" --posts slug-un,slug-deux --intro "Texte" --mode test --to moi@exemple.fr
  node scripts/send-newsletter.mjs --campaign 2026-11-a --subject "Objet" --posts slug-un,slug-deux --intro "Texte" --mode send
  ```
  
  Garanties : une livraison est **réservée avant l'envoi** (clé unique campagne × abonné) : personne ne reçoit deux fois la même campagne, même si deux appels se chevauchent ; un lot en échec libère ses réservations et se reprend en relançant la même commande ; le contenu d'une campagne est figé à son premier lot (même identifiant avec un autre objet, une autre introduction ou d'autres articles : 409). Chaque message porte son lien de désinscription signé et les en-têtes `List-Unsubscribe`. Limites : la liste est lue en entier à chaque lot (pagination de 1 000 lignes), prévu pour quelques milliers d'abonnés ; quelqu'un qui se désinscrit pendant un lot en cours peut encore recevoir ce lot ; pas de suivi d'ouverture ni de clic (aucun traceur) ; pas de planification (envoi lancé à la main).
- **Mentions du message.** Le pied de page indique l'éditeur (`LEGAL.publisherName`) et l'adresse de contact. L'adresse postale de l'éditeur (`LEGAL.address`) est vide tant que T01 n'est pas terminée : à renseigner et à ajouter au pied de page avant d'envoyer à de vrais abonnés si votre conseil juridique l'exige.
- **Avant d'activer.** Appliquer `0010_newsletter.sql`, vérifier `RESEND_API_KEY`, `EMAIL_FROM` et `CRON_SECRET` (ou `EMAIL_UNSUBSCRIBE_SECRET`), faire relire par un juriste la section « Newsletter » de la politique de confidentialité et le texte de consentement (brouillons), puis définir `NEWSLETTER_ENABLED=true` et redéployer. `npm run check:env` signale une activation sans e-mail configuré.

Articles d'entrée des inscriptions confirmées :

```sql
select props->>'article' as article, count(*) as inscriptions_confirmees
from analytics_events
where name = 'newsletter_confirmed' and created_at > now() - interval '30 days' group by 1 order by 2 desc;
```

## Mesure d'audience

Deux mesures coexistent. (1) Umami Cloud (`https://cloud.umami.is/script.js`, `src/app/layout.tsx`) : fréquentation générale, sans cookie ; chargé uniquement si `VERCEL_ENV=production`, avec `data-exclude-search` (aucun paramètre d'URL transmis) et `data-do-not-track`. L'identifiant du site est public. Les statistiques se consultent sur cloud.umami.is. (2) Mesure interne, sans cookie : table `analytics_events` (migration `0004_analytics_events.sql`), écrite uniquement par le service role. Un événement = nom, page, propriétés non personnelles (`source`, `offer`, `platform`, `activity`, `target`, `visual`, `article`). Aucun identifiant utilisateur, aucune adresse IP, aucun agent utilisateur. Les signaux « Do Not Track » et « Global Privacy Control » désactivent l'envoi navigateur.

| Événement | Origine | Déclencheur |
|---|---|---|
| `simulator_view` | navigateur | affichage du simulateur |
| `simulation_completed` | navigateur | première modification d'un paramètre du simulateur |
| `diagnostic_started` | navigateur | première interaction avec le diagnostic (`/onboarding`) |
| `diagnostic_completed` | navigateur | diagnostic terminé (recommandations affichées) |
| `home_view` | navigateur | chargement de l'accueil (`visual` : `photo` ou `none`, version du hero) |
| `cta_click` | navigateur | clic sur un bouton d'action : `source` = `header`, `hero`, `final`, `sticky` (barre fixe mobile), `encart` (encart des pages de contenu) ou `page`, `target` = `diagnostic`, `simulateur` ou `login` |
| `blog_view` | navigateur | chargement d'un article du blog (`article` = slug) ; les clics vers les outils sont des `cta_click` avec `source` = `blog` et le même `article` |
| `paywall_click` | navigateur | clic sur « Voir les packs et abonnements » depuis la limite d'annonces |
| `signup` | serveur | retour d'authentification d'un compte créé depuis moins de 2 minutes |
| `listing_generated` | serveur | annonce enregistrée |
| `checkout_started` | serveur | session Stripe Checkout créée |
| `payment_success` | serveur | webhook Stripe de paiement confirmé |
| `newsletter_confirmed` | serveur | inscription à la newsletter confirmée par le lien de l'e-mail (`article` = slug de l'article d'origine) |

`/api/track` n'accepte que les huit événements navigateur. Entonnoir accueil → clic → diagnostic → inscription → 1ʳᵉ annonce → paiement : `home_view`, `cta_click`, `diagnostic_started`, `diagnostic_completed`, `signup`, `listing_generated`, `payment_success`. Seules les vues de l'accueil sont comptées (dénominateur des clics) ; les autres visites de pages ne sont pas mesurées (aucun traceur) ; l'entonnoir interne ci-dessous ne dépend pas d'Umami. Umami Cloud est chargé sans cookie ni paramètre d'URL ; le besoin éventuel d'un bandeau de consentement reste à confirmer au regard des conditions d'exemption de la CNIL (réglages du compte Umami, absence de recoupement). Entonnoir sur 30 jours :

```sql
select name, count(*) from analytics_events
where created_at > now() - interval '30 days' group by name order by count(*) desc;
```

Taux de clic du hero, avec et sans photo (version du visuel dans `props->>'visual'`) :

```sql
select props->>'visual' as visuel,
       count(*) filter (where name = 'home_view') as vues_accueil,
       count(*) filter (where name = 'cta_click' and props->>'source' = 'hero' and props->>'target' = 'diagnostic') as clics_hero_diagnostic,
       count(*) filter (where name = 'cta_click' and props->>'source' = 'header' and props->>'target' = 'diagnostic') as clics_entete_diagnostic
from analytics_events
where created_at > now() - interval '30 days' and name in ('home_view', 'cta_click') group by 1;
```

Un clic n'est pas rattaché à une visite (aucun identifiant) : le rapport clics / vues est une approximation, fiable seulement sur des périodes de comparaison de même durée et de trafic comparable.

Articles d'entrée du blog qui mènent à un clic vers un outil (nécessite `blog_view` pour le dénominateur) :

```sql
select props->>'article' as article,
       count(*) filter (where name = 'blog_view') as vues,
       count(*) filter (where name = 'cta_click' and props->>'source' = 'blog') as clics_outil
from analytics_events
where created_at > now() - interval '30 days' and props ? 'article' group by 1 order by vues desc;
```

## Preuve sociale

Uniquement des données réelles. Rien ne s'affiche tant qu'il n'y a rien de réel : pas de note, pas d'étoile, pas de logo de média, pas de chiffre saisi à la main.

- **Compteur d'annonces** (accueil) : nombre de lignes `listings` créées depuis `SOCIAL_PROOF_SINCE` (jour d'ouverture au public, `AAAA-MM-JJ`), affiché seulement s'il atteint `SOCIAL_PROOF_MIN_LISTINGS` (100 par défaut). Sans `SOCIAL_PROOF_SINCE`, aucun compteur : les annonces des essais ne comptent pas. La page d'accueil se régénère toutes les heures.
- **Témoignages** : formulaire « Votre avis sur Compléo » sur `/dashboard/listings`, après une première annonce, avec case de consentement obligatoire, sans contrepartie. Table `testimonials` (migration `0009_testimonials.sql`) : un témoignage par compte, statut `pending` à l'envoi, lecture publique des seuls `approved`, retrait possible par l'auteur, effacement en cascade avec le compte, inclus dans l'export RGPD.
- **Modération** : dans l'éditeur SQL ou le Table Editor de Supabase, passer `status` à `approved` (ou `rejected`) après relecture. Ne pas modifier le texte d'un avis ; si besoin, le refuser. Aucune interface d'administration n'existe.
- Pas de balisage `Review` ni `AggregateRating` : les avis d'un site sur lui-même ne sont pas éligibles aux résultats enrichis de Google, et aucune note n'est collectée.

## Exploitation et maintenance

Environnements, branches, intégration continue, procédure de déploiement et de retour arrière, supervision, sauvegardes, calendrier de maintenance (dont la mise à jour fiscale du 1er janvier) et marche à suivre en cas d'incident : `docs/deploiement-et-maintenance.md`. Variables d'environnement de prévisualisation : `docs/preview-env-checklist.md`. Migration Next 16 : `docs/migration-next-16.md`.

Commandes utiles : `npm run check:env -- --env production|preview|development [--file .env]` (contrôle des variables, échoue sur un mélange d'environnements), `npm run check:photos` (photos Unsplash toujours disponibles), `/api/health` (sonde de disponibilité). Intégration continue : `.github/workflows/ci.yml`.

## Sécurité

- Row Level Security sur toutes les tables.
- Les colonnes `subscription_status`, `subscription_plan`, `listing_credits` et `stripe_customer_id` ne sont modifiables que via le service role (webhook Stripe) : un utilisateur ne peut pas s'attribuer le statut Premium.
- Signature des webhooks Stripe vérifiée.
- Quotas et droits contrôlés côté serveur.
- Redirections après connexion limitées aux chemins internes.
- La clé `SUPABASE_SERVICE_ROLE_KEY` reste côté serveur uniquement.

## Limites connues et avertissements

- Les estimations de revenus, le simulateur et le calcul de cumul avec le chômage sont **indicatifs** et ne constituent pas un conseil fiscal, juridique ou comptable. Les taux et plafonds sont centralisés dans `src/lib/tax.ts` et doivent être vérifiés chaque année (autoentrepreneur.urssaf.fr, service-public.fr).
- Les annonces générées par IA doivent être relues avant publication.
- Les modèles open source de petite taille respectent moins bien le format de sortie attendu ; en cas d'échec de génération, choisir un modèle plus grand.
- Les mentions légales sont un modèle : les champs de `src/lib/legal.ts` (statut, adresse, SIRET, TVA, e-mail, médiateur) sont à compléter et le texte à faire relire avant la mise en ligne.
- Pas encore de CGU/CGV, de politique de confidentialité dédiée ni de tests automatisés.

## Feuille de route

- [ ] Compléter `src/lib/legal.ts` et faire relire les mentions légales
- [ ] CGU/CGV (droit de rétractation de 14 jours) et politique de confidentialité
- [ ] Tests automatisés de `tax.ts` et `activities.ts`
- [ ] Déploiement (Vercel), webhook Stripe de production, passage en mode live
- [ ] Choix d'un fournisseur d'IA pour la production
- [ ] Suppression de compte et export des données (RGPD)
- [ ] Envoi des factures par e-mail

### E-mails (Resend)

- Envoi d'un devis ou d'une facture à un client : bouton enveloppe dans `/dashboard/invoices` (`POST /api/invoices/[id]/send`, PDF en pièce jointe, réponse du client adressée à l'utilisateur, 20 envois par 24 h et par utilisateur, adresse du client non conservée).
- Séquence d'accueil (J+1 simulateur, J+3 première annonce si aucune) et alertes à 80 % du seuil de TVA ou du plafond micro (calculées sur les factures « Payé » de l'année, hypothèse prestations de services) : cron quotidien `vercel.json` → `/api/cron/emails`. Réservés aux comptes ayant activé le réglage dans Mon compte (désactivé par défaut) ; désinscription en un clic (`/api/email/unsubscribe`, `List-Unsubscribe`).
- Newsletter du blog : appliquer les migrations `0010_newsletter.sql` (avant de définir `NEWSLETTER_ENABLED=true`) et `0011_newsletter_campaigns.sql` (avant le premier envoi, avec `NEWSLETTER_SEND_SECRET`). Voir « Newsletter du blog ».
- Appliquer la migration `0006_email.sql`. Dans Resend : vérifier le domaine d'envoi (DNS SPF/DKIM chez Cloudflare), créer une clé API.
- Témoignages (T24) : appliquer la migration `0009_testimonials.sql` avant de déployer le code (sinon la page Annonces du tableau de bord échoue à lire `testimonials`). Voir « Preuve sociale ».
- Annonces multi-sites (T20) : appliquer la migration `0007_listing_variants.sql` (colonne `listings.variants`, additive) avant de déployer le code, sinon l'enregistrement des annonces échoue (500, crédit remboursé). Une génération produit jusqu'à 5 versions (une par site choisi) et compte pour un seul quota ou crédit. Appliquer aussi `0008_listing_platforms.sql` (valeurs ajoutées au type énuméré `listing_platform`). Compléo ne publie rien sur ces sites.
