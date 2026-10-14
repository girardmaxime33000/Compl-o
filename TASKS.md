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
- statut: todo
- dépend de: -
- branche:
- critères d'acceptation: accessible déconnecté, métadonnées propres, bandeau d'estimation indicative.
- vérifications faites / non faites:

### T05 Modèle de facture et devis public
- statut: todo
- dépend de: T04
- branche:
- critères d'acceptation: page publique avec aperçu ; PDF après inscription.
- vérifications faites / non faites:

### T06 Générateur d'annonce : démo publique
- statut: todo
- dépend de: -
- branche:
- critères d'acceptation: démo sans compte, appel IA anonyme borné.
- vérifications faites / non faites:

### T07 Paywall et offres
- statut: todo
- dépend de: T02
- branche:
- critères d'acceptation: paywall, pack ponctuel, tarif annuel via STRIPE_*_PRICE_ID, webhook idempotent. Décision propriétaire requise sur les montants et la limite de factures gratuites.
- vérifications faites / non faites:

### T08 Onboarding vers inscription
- statut: todo
- dépend de: -
- branche:
- critères d'acceptation: 3 recommandations affichées avant demande d'e-mail.
- vérifications faites / non faites:

### T09 Fondations SEO
- statut: todo
- dépend de: -
- branche:
- critères d'acceptation: metadata, sitemap, robots, noindex pages privées, JSON-LD, Lighthouse avant/après.
- vérifications faites / non faites:

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
