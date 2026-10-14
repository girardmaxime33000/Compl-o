# TASKS

Suivi des tâches. Source : `CLAUDE.md` section 4.

### T01 Mentions légales
- statut: blocked
- dépend de: -
- branche: claude/new-session-og6dhq
- critères d'acceptation: aucun champ vide ou placeholder visible sur `/mentions-legales`.
- notes: BLOQUÉ, champs manquants dans `src/lib/legal.ts` : legalForm, address, email, phone, siret, vat, mediatorName, mediatorUrl. Valeurs à fournir par le propriétaire.
- vérifications faites / non faites:

### T02 CGU / CGV / confidentialité
- statut: done
- dépend de: -
- branche: claude/new-session-og6dhq
- critères d'acceptation: pages `/cgu`, `/cgv`, `/confidentialite` ; liens footer et écran de paiement ; case(s) à cocher avant Stripe Checkout validée(s) côté serveur ; textes marqués brouillon.
- vérifications faites / non faites: typecheck, lint, build OK (2026-10-14). Non fait : test manuel du flux Checkout (pas de clés Stripe), relecture juridique (textes en brouillon, bannière affichée).
- notes: deux cases (acceptation CGU/CGV/confidentialité ; accès immédiat + renonciation rétractation), validées dans `/api/stripe/checkout` (400 sinon) ; version et horodatage stockés en metadata de la session Stripe (`LEGAL.termsVersion`). Branche imposée par la session : `claude/new-session-og6dhq`.

### T03 Déploiement production
- statut: todo
- dépend de: T01, T02
- branche:
- critères d'acceptation: checklist précise ; étapes nécessitant des accès propriétaire marquées `blocked`.
- vérifications faites / non faites:

### T04 Simulateur public
- statut: done
- dépend de: -
- branche: claude/new-session-og6dhq
- critères d'acceptation: accessible déconnecté, métadonnées propres, bandeau d'estimation indicative.
- vérifications faites / non faites: typecheck, lint, build OK (2026-10-14). `next start` : `/simulateur-micro-entrepreneur` répond 200 sans session, titre, canonical et bandeau présents ; `/dashboard/simulator` redirige (307) déconnecté. Non fait : test navigateur interactif, régression manuelle des autres flux, Lighthouse (T09).
- notes: page publique réutilisant `Simulator` (calcul inchangé, `tax.ts`). Sauvegarde et export PDF de simulation n'existent pas dans l'app : seule la porte d'inscription (CTA compte gratuit) est posée ; fonctionnalités à créer avec T07. Route `/dashboard/simulator` conservée. Valeurs de `tax.ts` non revérifiées : mention ajoutée en commentaire, date de vérification à fournir par le propriétaire. Lien ajouté au footer et à l'accueil.

### T05 Modèle de facture et devis public
- statut: done
- dépend de: T04
- branche: claude/new-session-og6dhq
- critères d'acceptation: page publique avec aperçu ; PDF après inscription.
- vérifications faites / non faites: typecheck, lint, build OK (2026-10-14) ; `next start` : page 200 sans session, titre et mention 293 B présents. Non fait : test navigateur, régressions manuelles.
- notes: aperçu HTML statique à données fictives ; création et téléchargement PDF restent derrière connexion (`/dashboard/invoices`, existant) via CTA. Mention `TVA_MENTION` importée de `invoice-number.ts`. Liste des mentions non validée juridiquement (renvoi service-public.fr).

### T06 Générateur d'annonce : démo publique
- statut: done
- dépend de: -
- branche: claude/new-session-og6dhq
- critères d'acceptation: démo sans compte, appel IA anonyme borné.
- vérifications faites / non faites: typecheck, lint, build OK (2026-10-14) ; `next start` : `/generateur-annonce` 200 sans session. Non fait : test navigateur interactif, régressions manuelles.
- notes: option sans IA anonyme : un exemple pré-rédigé par activité du catalogue (titre/pitch/tarif issus de `activities.ts`, détails dans `demo-listings.ts`). Aucun appel IA anonyme, donc pas de limitation IP/cookie nécessaire. `/api/generate-listing` reste réservé aux connectés.

### T07 Paywall et offres
- statut: todo
- dépend de: T02
- branche:
- critères d'acceptation: paywall, pack ponctuel, tarif annuel via STRIPE_*_PRICE_ID, webhook idempotent. Décision propriétaire requise sur les montants et la limite de factures gratuites.
- vérifications faites / non faites:

### T08 Onboarding vers inscription
- statut: done
- dépend de: -
- branche: claude/new-session-og6dhq
- critères d'acceptation: 3 recommandations affichées avant demande d'e-mail.
- vérifications faites / non faites: typecheck, lint, build OK (2026-10-14). Non fait : parcours complet anonyme puis connexion (pas de Supabase réel), mesure de l'entonnoir (dépend de T12).
- notes: `/onboarding` publique (retirée des routes protégées). Anonyme : réponses gardées en localStorage, recommandations affichées sans e-mail, CTA compte ; à la connexion sur `/onboarding`, les réponses sont enregistrées via `saveOnboarding` (serveur, utilisateur requis) puis effacées. Mesure de l'entonnoir à brancher en T12.

### T09 Fondations SEO
- statut: done
- dépend de: -
- branche: claude/new-session-og6dhq
- critères d'acceptation: metadata, sitemap, robots, noindex pages privées, JSON-LD, Lighthouse avant/après.
- vérifications faites / non faites: typecheck, lint, build OK (2026-10-14). `next start` : robots.txt, sitemap.xml (9 URL), canonical et titre `Promesse | Compléo` par page publique, `noindex` sur /login et /onboarding, /dashboard redirige et porte noindex, image OG 200 image/png, JSON-LD de l'accueil parsé en JSON valide. NON fait : Lighthouse avant/après (non lancé), validation JSON-LD avec l'outil Google/schema.org, noindex de /auth (route handler : exclue via robots.txt uniquement).
- notes: helper `src/lib/seo.ts` (pageMetadata, PUBLIC_PAGES, NOINDEX), `src/components/seo/json-ld.tsx` (Organization, SoftwareApplication avec offres, BreadcrumbList). `PREMIUM_PRICE_EUR` dans seo.ts duplique le prix de /pricing : à aligner si le prix change (décision propriétaire en T07). Image OG unique (texte statique), non dynamique par page. `NEXT_PUBLIC_SITE_URL` doit être définitif (T03) pour canonical et sitemap.

### T10 Pages activité
- statut: todo
- dépend de: T09
- branche:
- critères d'acceptation: `/activites/[slug]` pour les 9 activités, source unique `activities.ts`.
- vérifications faites / non faites:

### T11 Pages activité × ville
- statut: todo
- dépend de: T10
- branche:
- critères d'acceptation: 20 villes validées, donnée propre à la ville par page, sinon `blocked`.
- vérifications faites / non faites:

### T12 Mesure
- statut: todo
- dépend de: -
- branche:
- critères d'acceptation: analytics sans données personnelles, événements listés.
- vérifications faites / non faites:

### T13 Guides éditoriaux
- statut: todo
- dépend de: T09
- branche:
- critères d'acceptation: 6 guides, chiffres issus de `tax.ts`.
- vérifications faites / non faites:

### T14 E-mail et rétention
- statut: todo
- dépend de: -
- branche:
- critères d'acceptation: factures par e-mail, séquence, alerte plafond. Fournisseur e-mail : décision propriétaire.
- vérifications faites / non faites:

### T15 RGPD
- statut: todo
- dépend de: -
- branche:
- critères d'acceptation: suppression de compte et export des données.
- vérifications faites / non faites:

### T16 Tests
- statut: todo
- dépend de: -
- branche:
- critères d'acceptation: tests `tax.ts`, `activities.ts`, quota annonces, webhook Stripe.
- vérifications faites / non faites:
