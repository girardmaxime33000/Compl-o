# Audit UI/UX et plan d'implémentation des visuels (Unsplash) : Compléo

Date : 2026-10-15. Objectif : site B2C à conversion maximale (diagnostic gratuit → inscription → paywall).

## 0. Périmètre et limites de l'audit

- Le site https://compleo.work n'est pas joignable depuis l'environnement d'exécution (échec DNS `ENOTFOUND`). Aucune capture, aucun Lighthouse, aucune mesure réelle.
- L'audit porte sur le code source du dépôt, branche `claude/new-session-og6dhq` : `src/app/**`, `src/components/marketing/**`, `public/images/*.svg`, `scripts/fetch-city-images.py`.
- Non vérifié : rendu réel, performances réelles (LCP, CLS), comportement mobile réel, état de déploiement (la prod peut différer du dépôt), analytics existants (entonnoir).
- Aucune donnée d'audience : les priorités ci-dessous sont des hypothèses à valider par mesure (section 8).

## 1. État actuel des visuels

| Zone | Fichier | Visuel actuel | Constat |
|---|---|---|---|
| Hero accueil | `src/app/page.tsx` | `public/images/hero-compleo.svg` (illustration vectorielle abstraite) | Aucune présence humaine, aucun aperçu produit. Faible charge émotionnelle pour un produit B2C « complément de revenu ». |
| Comment ça marche | `page.tsx` | `parcours-compleo.svg` masqué sous 640 px + icônes Lucide | Visuel absent sur mobile, redondant avec les cartes. |
| Aperçu activités | `visuals.tsx` (`ActivityVisual`) | Dégradé + pictogramme Lucide | Générique, interchangeable d'une activité à l'autre. |
| Guides | `GuideVisual` | Idem | Idem. Absent des cartes de l'accueil (texte seul). |
| Pages activité | `activites/[slug]/page.tsx` | Bandeau dégradé `hero` | Pas de contexte réel (lieu, geste, client). |
| Pages ville | `city-photo.tsx` | Photo Unsplash prévue | `src/data/city-images.json` contient `"photos": {}` : aucune photo n'est affichée aujourd'hui. Le pipeline existe mais n'a pas été exécuté. |
| Login | `login/page.tsx` | Aucun | Écran nu, pas de réassurance. |
| Pricing | `pricing/page.tsx` | Aucun | Tableau et cartes sans élément de réassurance visuelle. |
| Onboarding | `components/onboarding/wizard.tsx` | À vérifier (250 lignes, non audité en détail) | Étape cruciale de l'entonnoir : voir 3.6. |
| OG | `opengraph-image.tsx` | Texte statique | Partages sociaux sans visuel d'activité. |

Acquis réutilisables : pipeline Unsplash conforme (`scripts/fetch-city-images.py` : recherche, planche de contact, déclaration de téléchargement, JSON versionné, hotlink, crédit avec UTM), `src/lib/city-images.ts`, `CityPhoto`, repli sur dégradés. Il faut généraliser, pas réécrire.

## 2. Audit UX/UI et conversion

Gravité : B bloquant conversion, M majeur, m mineur.

### 2.1 Structure et navigation

- B. Pas d'en-tête partagé. L'accueil a son propre `<header>` (logo texte + Simulateur, Tarifs, Connexion). Les pages `/pricing`, `/activites/[slug]`, `/login` n'affichent que le logo : aucune navigation, aucun CTA. Impasses de parcours sur les pages d'atterrissage SEO, qui sont l'entrée principale du trafic.
- B. Bouton « Connexion » en style primaire dans l'en-tête : il concurrence le CTA « Faire mon diagnostic gratuit » (le seul que l'on veut maximiser). Passer « Connexion » en `ghost`, ajouter le CTA diagnostic en primaire.
- M. Pas de CTA collant sur mobile (barre basse « Diagnostic gratuit ») sur les pages longues (activité, ville, guides).
- m. Logo = icône `Rocket` + texte. Pas de marque visuelle distinctive ni de favicon à vérifier.

### 2.2 Hero (accueil)

- Promesse claire et conforme aux garde-fous (« estimation selon profil et temps disponible »). À conserver.
- B. Visuel abstrait, sans humain ni preuve produit : le visiteur ne voit ni le résultat ni quelqu'un qui lui ressemble.
- M. Deux CTA de poids visuel proche (diagnostic en plein, simulateur en contour : acceptable) mais le micro-texte de réassurance est sous les boutons, en `text-sm` grisé. Remonter « gratuit, sans inscription, sans carte bancaire » en pastilles à côté du CTA.
- M. Aucun élément de confiance visuel (source des données, URSSAF/INSEE/France Travail en logos textuels serait légitime : ces sources sont déjà citées en pied de page).

### 2.3 Corps de page

- M. « Un aperçu de ce que vous obtenez » : cartes à dégradé + pictogramme, peu désirables. C'est la section la plus propice à la photo.
- M. Section « Activités et villes à explorer » : deux listes de liens soulignés. Zone à fort potentiel SEO et d'exploration, sans attrait visuel ni hiérarchie.
- M. Section « Des repères issus de données publiques » : les compteurs (activités du catalogue, villes couvertes, pages avec donnée locale, guides) décrivent le contenu du site, pas un bénéfice pour l'utilisateur. Compteurs réels, donc conformes, mais faible valeur persuasive. Remplacer par des bénéfices chiffrés issus de `tax.ts` / `activities.ts` ou les replacer en pied de page.
- m. Guides de l'accueil : cartes texte seul.
- B. Le simulateur d'accueil est un bloc de texte. Un mini-aperçu visuel (jauge brut → cotisations → net) convertirait mieux qu'un paragraphe.
- m. CTA final : cadre à bordure sans visuel ni contraste. Section de clôture à renforcer (fond photo + voile, ou fond couleur de marque).

### 2.4 Pages de contenu SEO (activité, ville, guide)

- M. Bandeau `hero` dégradé en tête : consomme de la hauteur sans information. Remplacer par photo contextuelle à ratio fixe (pas de CLS).
- M. Pas de CTA au-dessus de la ligne de flottaison sur ces pages : le premier CTA apparaît plus bas. Ajouter un encart « Faire mon diagnostic » dans la colonne latérale (desktop) ou barre collante (mobile).
- m. Tableaux (revenu par heures) : bon contenu, mais sans visualisation. Une barre horizontale par palier (CSS, pas de lib) rendrait la progression lisible.

### 2.5 Pricing et login

- M. Pricing : aucune réassurance visuelle (paiement sécurisé Stripe, rétractation 14 jours, résiliation en un clic : à n'afficher que si vrai et vérifié dans les CGV). Offre recommandée à surligner (badge), à décider avec le propriétaire (prix et positionnement = décision propriétaire, cf. CLAUDE.md).
- M. Login : écran minimal sans rappel de la promesse. Écran partagé desktop (formulaire + photo/aperçu produit), mobile : formulaire seul.

### 2.6 Onboarding (diagnostic)

- À examiner avec `wizard.tsx`. Recommandation de principe : cartes de choix des « domaines qui vous plaisent » avec photo (ratio 4:3, texte en surimpression lisible) plutôt que cases à cocher texte ; barre de progression ; résultat (3 recommandations) illustré par les photos d'activité. C'est l'écran où la photo a le meilleur ratio gain/effort après le hero.

### 2.7 Accessibilité et performance (à vérifier après implémentation)

- Contraste texte sur photo : voile dégradé obligatoire, ratio ≥ 4,5:1 mesuré.
- Visuels décoratifs `aria-hidden` et `alt=""` ; photos porteuses de sens avec `alt` descriptif en français.
- `next/image` avec `unoptimized` (cas actuel de `CityPhoto`) supprime le `srcset` : un mobile télécharge 1200 px. Corriger via un `loader` personnalisé (section 4.3).
- Hero : `priority`, ratio fixé, `sizes` correct. Les autres images : `loading="lazy"`.
- `prefers-reduced-motion` respecté pour tout effet (zoom au survol, parallaxe : à éviter).

## 3. Recommandations visuelles par page

Règle générale : photos réelles, lumineuses, personnes en situation de travail ou de service, cadrage serré, palette compatible avec le bleu primaire (`hsl(221 83% 53%)`). Ne jamais légender une photo comme un utilisateur, un témoignage ou un revenu réel (CLAUDE.md : aucun faux avis, aucune fausse preuve).

| Page | Emplacement | Visuel | Format / ratio | Priorité |
|---|---|---|---|---|
| `/` | Hero | Photo humaine (personne à son ordinateur à domicile ou en activité de service) + 2 cartes UI flottantes rendues en HTML (« Annonce prête », « Net estimé ») alimentées par `simulate()` | 4:3 desktop, 16:10 mobile ; `priority` | 1 |
| `/` | Aperçu activités (3 cartes) | Photo d'activité + badge revenu estimé | 3:2 | 1 |
| `/` | Activités et villes | Mosaïque de tuiles photo (6 activités, 6 villes) avec voile | 1:1 / 4:3 | 2 |
| `/` | Guides | Couverture photo par guide | 16:9 | 3 |
| `/` | Simulateur | Mini-graphique CSS brut → cotisations → net, sans photo | composant | 2 |
| `/` | CTA final | Fond photo + voile bleu foncé | pleine largeur | 3 |
| `/activites` | Cartes | Photo d'activité | 3:2 | 1 |
| `/activites/[slug]` | En-tête | Photo d'activité à la place du dégradé + crédit | 21:9 desktop, 16:9 mobile | 1 |
| `/activites/[slug]/[ville]` | En-tête | Photo de la ville (déjà prévu) sinon photo d'activité | idem | 1 |
| `/villes/[ville]` | En-tête, tuiles activité | Photo ville ; tuiles activité en photo | 21:9 / 1:1 | 2 |
| `/guides`, `/guides/[slug]` | Cartes et en-tête | Couverture photo par guide | 16:9 | 3 |
| `/onboarding` | Choix de domaines, résultat | Photos d'activité | 4:3 | 1 |
| `/login` | Colonne latérale (≥ lg) | Photo + promesse + 3 puces de réassurance | 4:5 | 3 |
| `/pricing` | Aucun visuel photo | Badges, icônes de réassurance (vrai uniquement) | icônes | 2 |
| OG (`opengraph-image.tsx`, `activites/[slug]/opengraph-image.tsx`) | Fond | Photo d'activité sous voile + titre | 1200×630 | 3 |
| `/modele-facture-auto-entrepreneur`, `/generateur-annonce` | Aperçu | Capture/rendu HTML du PDF et de l'annonce plutôt que photo | composant | 2 |

### 3.1 Requêtes Unsplash suggérées (à valider sur planche de contact)

Anglais pour la pertinence des résultats, `orientation=landscape` (portrait pour le login).

| Clé | Requête |
|---|---|
| `hero` | `woman working laptop home bright`, `freelancer smiling laptop kitchen` |
| `bricolage` | `handyman repairing home` |
| `montage_meubles` | `assembling furniture` |
| `soutien_scolaire` | `tutor teaching student` |
| `cours_langue` | `language lesson teacher` |
| `coursier` | `bicycle courier city` |
| `garde_animaux` | `dog walker park` |
| `menage` | `home cleaning service` |
| `jardinage` | `gardening hands plants` |
| `aide_informatique` | `helping senior with computer` |
| `depot_vente` | `second hand selling items` |
| Guides (6) | `calculator paperwork desk`, `unemployment job center`, `invoice quote desk`, `senior working laptop`, `writing advertisement`, `tax documents` |
| `login` | `person smiling smartphone` (portrait) |

## 4. Intégration technique de l'API Unsplash

### 4.1 Principe : sélection à la construction, pas d'appel à l'exécution

Conserver l'architecture existante : le script sélectionne et déclare, un JSON versionné est lu par les pages, les images sont servies par `images.unsplash.com`. Avantages : aucun quota consommé par les visiteurs, aucune clé côté site, aucune latence supplémentaire, rendu statique (SSG/ISR) intact.

Ne pas appeler l'API depuis le navigateur ni depuis les Server Components à chaque requête (limite de 50 req/h en mode demo, clé exposée, latence).

### 4.2 Conformité aux directives de l'API (à respecter)

1. Hotlink des URL `images.unsplash.com` (ne pas copier les fichiers dans `public/` ni les proxifier).
2. Déclarer chaque photo retenue via `download_location` (déjà fait par `build`).
3. Crédit visible : photographe + Unsplash, liens avec `?utm_source=compleo&utm_medium=referral` (déjà dans `withUtm`). Un crédit par photo affichée, y compris dans les mosaïques : légende en infobulle ou ligne `text-xs` discrète ; pour les fonds décoratifs, crédit regroupé en pied de page (page « Crédits photos » liée au footer).
4. Mode demo limité à 50 requêtes/heure : le script s'arrête avant épuisement (déjà géré). Avant mise en ligne publique, demander le passage en mode production sur https://unsplash.com/developers (à vérifier dans les conditions en vigueur : décision propriétaire).
5. Ne pas suggérer un parrainage ou une approbation par Unsplash ou le photographe. Ne pas utiliser une photo de personne dans un contexte sensible ou diffamatoire (licence Unsplash : pas d'autorisation de modèle garantie).
6. Clé `UNSPLASH_ACCESS_KEY` : variable d'environnement locale du propriétaire, jamais dans le dépôt (déjà documenté dans `.env.example`).

### 4.3 Modifications de code

Données : généraliser `src/data/city-images.json` en `src/data/images.json` (ou ajouter un second fichier `visual-images.json`) :

```json
{
  "source": "Unsplash",
  "selectedOn": "2026-10-15",
  "photos": {
    "hero:home":            { "id": "...", "raw": "https://images.unsplash.com/photo-...", "width": 0, "height": 0, "color": "#xxxxxx", "blurHash": "...", "author": "...", "authorUrl": "...", "pageUrl": "...", "alt": "..." },
    "activity:bricolage":   { "...": "..." },
    "guide:annonces-efficaces": { "...": "..." },
    "city:paris":           { "...": "..." }
  }
}
```

- Ajouter `color` (couleur moyenne, fournie par l'API) pour le fond de remplacement avant chargement : zéro CLS, zéro flash blanc.
- Script : ajouter un catalogue de clés → requête (table 3.1) à côté de `QUERY_OVERRIDES`, mêmes commandes `search` / `build`, sélection dans `scripts/visual-images-selection.json`. Budget : environ 25 clés × (1 recherche + 1 déclaration) ≈ 50 requêtes, soit 2 passes à une heure d'intervalle en mode demo.
- `src/lib/city-images.ts` : exporter un `unsplashLoader({ src, width, quality })` qui ajoute `w`, `q`, `fm=webp`, `fit=crop`, `auto=format`. Passer `loader={unsplashLoader}` à `next/image` et retirer `unoptimized` : `srcset` généré, images toujours servies par Unsplash. `next.config.mjs` n'a pas besoin de `remotePatterns` avec un loader personnalisé.
- Composants (dans `src/components/marketing/`) :
  - `Photo` (générique : `photoKey`, `ratio`, `sizes`, `priority`, `overlay`, `credit`) avec repli automatique sur le dégradé existant de `visuals.tsx` quand la clé est absente. Aucune page ne casse si une photo manque.
  - `ActivityVisual` et `GuideVisual` : utiliser `Photo` si disponible, sinon comportement actuel (migration non destructive).
  - `PhotoCredits` : liste des crédits pour une page « Crédits photos ».
  - `SiteHeader` partagé (logo, Simulateur, Tarifs, Connexion en `ghost`, CTA diagnostic en primaire) et `StickyCta` mobile.
  - `HeroShowcase` : photo + cartes UI flottantes calculées par `simulate()` (pas de chiffres inventés).
- CSP : si une CSP est ajoutée (T03), autoriser `img-src https://images.unsplash.com`. Aucune CSP n'est configurée dans `next.config.mjs` ni `vercel.json` à ce jour.
- Tests : étendre `src/lib/city-images.test.ts` (loader, repli quand clé absente, UTM sur chaque lien de crédit).
- README : documenter les nouvelles clés et la commande, section « Photos de villes (Unsplash) » à renommer « Photos (Unsplash) ».

### 4.4 Budget de performance

- Hero : 1 image WebP ≤ 120 Ko mobile (`w=800,q=70`), `priority`, ratio déclaré.
- Pages à cartes : `loading="lazy"`, `sizes="(min-width:768px) 33vw, 100vw"`.
- Total images au-dessus de la ligne de flottaison ≤ 150 Ko mobile.
- Objectifs à mesurer avant/après : LCP ≤ 2,5 s, CLS ≤ 0,1, Lighthouse Accessibilité ≥ 95 (non mesurés à ce jour).

## 5. Plan de mise en œuvre (ordre recommandé)

| # | Lot | Contenu | Dépendance |
|---|---|---|---|
| V1 | Pipeline | Étendre le script, catalogue de requêtes, exécution `search`, revue de la planche, `build`. Commit du JSON. | Clé API (propriétaire) |
| V2 | Fondations | `unsplashLoader`, composant `Photo`, `PhotoCredits`, page « Crédits photos », tests | V1 |
| V3 | Navigation | `SiteHeader` partagé, CTA primaire, `StickyCta` mobile, application aux pages publiques | aucune (peut démarrer sans V1) |
| V4 | Hero accueil | Photo + `HeroShowcase`, micro-texte de réassurance en pastilles | V2 |
| V5 | Activités | Cartes accueil, `/activites`, `/activites/[slug]`, tuiles `/villes/[ville]` | V2 |
| V6 | Onboarding | Cartes de choix photo, résultat illustré | V2 |
| V7 | Villes | Exécution du pipeline villes déjà prévu (JSON actuellement vide) | V1 |
| V8 | Secondaires | Guides, CTA final, login, OG, pricing (icônes) | V2 |
| V9 | Mesure | Événements d'entonnoir (T12 : `/api/track`) : vue hero, clic CTA hero/header/sticky, démarrage et fin du diagnostic, avant/après chaque lot | T12 |

Chaque lot : branche `claude/<id>-<slug>`, vérifications `npm run typecheck`, `npm run lint`, `npm run build`, test des pages touchées, mise à jour de `TASKS.md` et du README. Une PR par lot, sur demande explicite uniquement.

## 6. Décisions requises du propriétaire

- Clé `UNSPLASH_ACCESS_KEY` et passage de l'application Unsplash en mode production avant lancement public.
- Validation de la sélection de photos (planche de contact) : cohérence de marque, absence de personnes identifiables dans un contexte sensible.
- Message de réassurance sur `/pricing` : n'afficher que des promesses vraies et couvertes par les CGV (rétractation, résiliation, paiement Stripe).
- Offre à mettre en avant sur `/pricing` (positionnement tarifaire).
- Éventuelle identité visuelle (logo) : aujourd'hui icône `Rocket` + texte.

## 7. Risques

- Image hotlinkée indisponible ou retirée par son auteur : le repli sur dégradé évite la page cassée ; contrôle périodique des URL (script `check` à prévoir).
- Photos de stock perçues comme génériques : privilégier cadrages d'action et lieux français, éviter les poses de « bureau stock » ; la preuve produit (cartes UI réelles) compense.
- Poids des images : tenir le budget 4.4, sinon la conversion mobile baisse malgré le gain visuel.
- Crédit absent ou sans UTM = non-conformité Unsplash : test automatisé (4.3).
- Aucun faux témoignage, aucun compteur d'utilisateurs, aucune photo présentée comme client réel.

## 8. Mesure du gain

- Référence : relever avant modification taux de clic CTA hero, taux de démarrage et d'achèvement du diagnostic, taux d'inscription, LCP/CLS (mobile).
- Déployer par lot, comparer sur des périodes équivalentes, ou en test A/B sur le hero (50/50) si le trafic le permet. Volume de trafic actuel inconnu : sans échantillon suffisant, aucune conclusion statistique.
- Critère de conservation d'un lot : pas de dégradation du LCP mobile au-delà de 10 % et hausse (ou neutralité) du taux de clic CTA.
