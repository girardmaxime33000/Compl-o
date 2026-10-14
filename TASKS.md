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
- statut: blocked
- dépend de: T02
- branche: claude/new-session-og6dhq
- critères d'acceptation: paywall 3e annonce du mois et export PDF de simulation ; pack ponctuel (`mode: payment`) et tarif annuel (`mode: subscription`) via `STRIPE_*_PRICE_ID` ; webhook `checkout.session.completed` idempotent par `event.id` ; migration SQL additive, RLS conservée, colonnes de droits réservées au service role ; limite de factures gratuites selon décision propriétaire.
- vérifications faites / non faites: typecheck, lint, build OK (2026-10-14). `next start` : /pricing 200 avec les prix 4,99 / 6,99 / 69,99 ; checkout sans session 401 ; webhook sans signature 400 ; webhook signature invalide 400 ; generate-listing sans session 401. NON fait : application de la migration 0003 sur Supabase, achat réel en mode test Stripe de chacune des 3 offres, webhook avec signature valide (crédit du pack, plan mensuel/annuel, doublon d'événement), consommation et remboursement de crédit, quota journalier (heure de Paris), parcours connecté de bout en bout. Aucun test automatisé (T16).
- notes: offres (décision propriétaire) : pack ponctuel 4,99 € = 4 annonces (paiement unique), pack mensuel 6,99 € = 10 annonces/jour, annuel 69,99 € = illimité. Gratuit inchangé : 2 annonces/mois. Prix Stripe via `STRIPE_PACK_PRICE_ID`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_ANNUAL_PRICE_ID` (remplacent `STRIPE_PREMIUM_PRICE_ID`) ; montants affichés dans `src/lib/offers.ts`, à garder identiques à Stripe. Migration `0003_offers_credits.sql` : `subscription_plan`, `listing_credits`, table `stripe_events` (RLS sans policy), fonctions `consume_listing_credit` / `grant_listing_credits` réservées au service role, `listings_count_today`. Un abonnement actif sans plan est traité comme mensuel. Le quota du plan est consommé avant les crédits ; crédit remboursé si la génération échoue. Limite connue : deux requêtes simultanées peuvent dépasser le quota d'une annonce (comptage non atomique, comme avant). CGV mises à jour (3 offres), `termsVersion` incrémentée, texte toujours en brouillon.
- constaté par le propriétaire (2026-10-14, test local mode test) : achat du pack ponctuel OK (checkout 200, webhook 200 après correction du secret `whsec_` de `stripe listen`), 4 crédits affichés sur /dashboard/listings. Affichage corrigé : plus de barre rouge « 2/2 » tant qu'il reste des crédits. Non testé : consommation des crédits, mensuel, annuel.
- bloqué / questions propriétaire : (1) l'export PDF de simulation n'existe pas dans l'app : le créer (et le réserver aux comptes payants ?) ou retirer ce critère ; (2) factures gratuites : laisser illimitées (état actuel) ou limiter, et à combien ; (3) durée de validité des crédits du pack (aucune expiration implémentée, CGV silencieuses) ; (4) appliquer la migration 0003, définir les 3 variables Stripe, activer les événements webhook `checkout.session.async_payment_succeeded` et `customer.subscription.*`, puis tester en mode test ; (5) configurer le portail client Stripe pour autoriser le changement mensuel vers annuel (le checkout refuse un second abonnement).

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
- statut: done
- dépend de: T09
- branche: claude/new-session-og6dhq
- critères d'acceptation: `/activites/[slug]` pour les 9 activités, source unique `activities.ts`.
- vérifications faites / non faites: typecheck, lint, build OK (2026-10-14). `next start` : 5 slugs testés 200, slug inconnu 404, canonical et titre uniques, sitemap à 20 URL (9 pages + index + 10 activités), BreadcrumbList à 3 niveaux. Non fait : test navigateur (simulateur pré-rempli), Lighthouse, régressions manuelles.
- notes: le catalogue `activities.ts` compte 10 activités (le backlog en annonçait 9) : une page par entrée, source unique, sitemap et slugs générés depuis le catalogue. Ajouts : `/activites` (index), `monthlyIncomeRange`, `regimeOf` (BNC/BIC indicatif d'après les repères du simulateur, à faire confirmer sur urssaf.fr), `relatedActivities`. Pour `garde_animaux` et `depot_vente` (unités « visite » / « article vendu ») le revenu assimile une heure à une unité : mention affichée sur la page. Simulateur pré-rempli au milieu de fourchette pour `idealHours`. Exemple d'annonce issu de `demo-listings.ts`.

### T11 Pages activité × ville
- statut: done
- dépend de: T10
- branche: claude/new-session-og6dhq
- critères d'acceptation: 20 villes validées, donnée propre à la ville par page, sinon `blocked`.
- vérifications faites / non faites: typecheck, lint, build OK (2026-10-14), 222 pages statiques générées. `next start` : sitemap à 204 URL (dont 184 pages activité × ville), pages attendues en 200, couples sans donnée locale en 404 (garde-animaux/paris, soutien-scolaire/le-havre), titre et description uniques avec chiffres de la ville, aucun « undefined » ni « NaN » dans le texte visible. Script exécuté sans erreur : les 20 bassins BMO sont retrouvés dans les deux millésimes. NON fait : test navigateur, Lighthouse, contrôle manuel des 184 pages, validation par le propriétaire du rattachement ville → bassin et activité → métiers (choix éditoriaux dans `scripts/build-city-data.py`).
- notes: sources (fichiers fournis par le propriétaire, téléchargés le 2026-10-14) : INSEE populations légales (archive datée du 2022-12-14, populations en vigueur au 1er janvier 2023) et France Travail BMO 2024 et 2025. Les 20 villes sont les 20 communes les plus peuplées calculées depuis le fichier (Paris, Lyon, Marseille agrégées par arrondissements) : Paris, Marseille, Lyon, Toulouse, Nice, Nantes, Montpellier, Strasbourg, Bordeaux, Lille, Rennes, Reims, Toulon, Saint-Étienne, Le Havre, Dijon, Grenoble, Angers, Villeurbanne, Saint-Denis (La Réunion). Donnée propre à la ville : projets de recrutement (dont difficiles, saisonniers, évolution 2024-2025) dans les métiers de l'activité, par bassin d'emploi. Ce sont des emplois salariés : indicateur d'activité du secteur, pas de demande de services (mention affichée sur chaque page). Valeurs masquées (« * ») : totaux affichés « au moins N ». Page générée seulement si au moins 1 projet de recrutement en 2025 pour l'activité (le garde d'animaux n'a une page que dans 5 villes). Non utilisés : BMO 2026 (publié par comité local, totaux incomplets, pas de comparaison fiable), BMO 2021-2023 (codes métiers différents), base permanente des équipements (communes de petite taille, population 2010, aucune des 20 villes sauf des arrondissements de Paris), `dossier_complet.csv` (8 Go, non versionné). Enrichissement INSEE fait (2026-10-14) : le propriétaire a extrait son `dossier_complet.csv` (format long, 8 Go, 92,6 millions de lignes) avec `scripts/extract-dossier-complet.py` ; `data/raw/insee_dossier_complet_20_communes.csv` (21 200 lignes) intégré dans `build-city-data.py` (communes `GEO_OBJECT = COM`, dernier millésime : recensement 2023, Filosofi 2023). Indicateurs par commune : part des moins de 15 ans, des 15-24 ans, des 65 ans et plus, des 80 ans et plus, de maisons, de ménages sans voiture, de résidences principales construites avant 1971, de ménages installés depuis moins de 2 ans, niveau de vie médian, taux de pauvreté. Écarts avec la demande initiale : les 6-17 ans et les 75 ans et plus n'existent pas dans ce fichier (tranches <15, 15-24, 65-79, 80+), remplacés par les <15 ans, 15-24 ans et 65 ans et plus. Hypothèse à confirmer : `DWELLINGS_TDW_1` = maisons (cohérent : Paris 0,8 %, somme des types = total des logements). Chaque page affiche 2 à 3 indicateurs choisis par activité (`INDICATORS_BY_ACTIVITY` dans `src/lib/cities.ts`) avec la moyenne simple des 20 villes. Choix indicateur → activité éditorial, sans lien de causalité affirmé. Villeurbanne et Lyon sont deux bassins distincts. Pages à relire : le rattachement Saint-Denis → bassin « REUNION NORD » repose sur la géographie de l'île.
### T12 Mesure
- statut: blocked
- dépend de: -
- branche: claude/new-session-og6dhq
- critères d'acceptation: analytics sans données personnelles, événements listés.
- vérifications faites / non faites: typecheck, lint, build OK (2026-10-14). `next start` : `/api/track` refuse un événement serveur (400) et un corps invalide (400), accepte `simulator_view` (204), ignore les propriétés hors liste (code de `sanitizeProps`, non testé par appel réel). NON fait : application de la migration 0004, vérification des lignes réellement insérées, déclenchement navigateur des 3 événements client, `signup`, `listing_generated`, `checkout_started`, `payment_success` de bout en bout, comportement avec Do Not Track activé.
- notes: choix sans fournisseur tiers : mesure interne dans Supabase (aucun envoi de données à un outil externe), sans cookie ni identifiant. Mentions légales et confidentialité mises à jour (cookies/mesure d'audience), textes toujours en brouillon : l'exemption de consentement dépend des conditions CNIL pour la mesure d'audience, à faire relire par un juriste. Pas de limitation de débit sur `/api/track` (risque de pollution des compteurs par un tiers). Aucun tableau de bord : requête SQL dans le README. `simulation_completed` = première modification d'un paramètre.
- bloqué / questions propriétaire : appliquer `0004_analytics_events.sql`, jouer le parcours (simulateur, annonce, paiement test) puis vérifier les lignes dans `analytics_events` ; confirmer que la mesure interne convient (sinon choisir Plausible/Umami/autre).

### T13 Guides éditoriaux
- statut: blocked
- dépend de: T09
- branche:
- critères d'acceptation: 6 guides, chiffres issus de `tax.ts`.
- vérifications faites / non faites: rien implémenté.
- notes: BLOQUÉ (sources officielles inaccessibles). Les 6 guides (cumul chômage/micro-entreprise, franchise de TVA, plafonds 2026, premier devis, activité complémentaire retraité, annonces efficaces) portent sur des règles fiscales et sociales : la règle du projet impose une source officielle citée et une date de vérification, et les valeurs de `tax.ts` n'ont jamais été revérifiées. Test du 2026-10-14 : `www.autoentrepreneur.urssaf.fr`, `www.urssaf.fr`, `entreprendre.service-public.fr`, `www.service-public.fr`, `www.impots.gouv.fr`, `bofip.impots.gouv.fr` et `francetravail.fr` ne répondent pas depuis l'environnement (hôtes non autorisés ou connexion coupée). Écrire ces guides de mémoire et afficher une date de vérification serait faux. Deux voies : (a) autoriser ces domaines dans Network access (certains sites officiels coupent peut-être les connexions venant d'une infrastructure cloud, comme data.gouv.fr) ; (b) le propriétaire colle ici les passages officiels (plafonds, seuils de TVA, règles de cumul ARE) avec leur URL et la date de consultation. Le guide « annonces efficaces » ne dépend d'aucune source fiscale et pourrait être rédigé seul.

### T14 E-mail et rétention
- statut: todo
- dépend de: -
- branche:
- critères d'acceptation: factures par e-mail, séquence, alerte plafond. Fournisseur e-mail : décision propriétaire.
- vérifications faites / non faites:

### T15 RGPD
- statut: blocked
- dépend de: -
- branche: claude/new-session-og6dhq
- critères d'acceptation: suppression de compte et export des données.
- vérifications faites / non faites: typecheck, lint, build OK (2026-10-14). `next start` : `GET /api/account/export` sans session 401 ; `/dashboard/account` sans session redirige (307). NON fait : export réel (contenu du JSON), suppression réelle d'un compte de test (Stripe client supprimé, utilisateur Supabase supprimé, cascade profil/annonces/factures/compétences), refus de la suppression sans le mot de confirmation côté serveur (code écrit, non exécuté).
- notes: `/dashboard/account` (lien dans l'en-tête du dashboard) ; `GET /api/account/export` (JSON : compte, profil, compétences, annonces, factures, via la session de l'utilisateur donc sous RLS) ; action serveur `deleteAccount` : confirmation « SUPPRIMER », suppression du client Stripe (résilie les abonnements ; en cas d'échec on s'arrête), puis `auth.admin.deleteUser` (cascade). Les crédits d'annonces non utilisés sont perdus (affiché). Les événements d'audience sont anonymes et non rattachés au compte. Politique de confidentialité mise à jour (texte en brouillon). Les factures émises par l'utilisateur sont supprimées avec le compte : si l'utilisateur doit les conserver légalement, l'export est son recours (à signaler dans les CGU si besoin).
- bloqué / à faire par le propriétaire : tester avec un compte de test (achat de pack puis suppression, vérifier dans Stripe et dans Supabase Auth).

### T16 Tests
- statut: done
- dépend de: -
- branche: claude/new-session-og6dhq
- critères d'acceptation: tests `tax.ts`, `activities.ts`, quota annonces, webhook Stripe.
- vérifications faites / non faites: `npm test` : 5 fichiers, 33 tests verts ; typecheck, lint, build OK (2026-10-14). Tests qui échouent quand le code est cassé (vérifié par mutation : suppression du test de doublon du webhook, désactivation du contrôle de quota). Non fait : tests contre une vraie base Supabase ou le vrai Stripe (Supabase, Stripe et l'IA sont simulés), tests d'interface, intégration continue (aucun workflow GitHub Actions).
- notes: Vitest. `tax.test.ts` (cotisations, alertes TVA et plafond, ARE, plafonnement), `activities.test.ts` (catalogue, revenus, recommandations, slugs), `quota.test.ts` (plan effectif, quotas gratuit/mensuel/annuel), `route.test.ts` du webhook (signature absente et invalide, idempotence par `event.id`, crédit du pack une seule fois, paiement non confirmé, libération de la réservation et rejeu après échec, plan annuel, résiliation) et de `generate-listing` (connexion, 3e annonce bloquée, crédit consommé, remboursement si échec, plafond quotidien, annuel illimité). Les tests de `tax.ts` lisent `TAX_PARAMS` : ils vérifient la logique, pas l'exactitude des taux.
