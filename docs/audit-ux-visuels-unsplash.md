# Audit UI/UX et visuels Unsplash : Compléo (état final)

Date : 2026-10-15. Branche `claude/new-session-og6dhq`. Objectif : site B2C à conversion maximale (diagnostic gratuit → inscription → paywall).

Ce document remplace les versions précédentes. Il reprend les constats de l'audit, l'état de chaque lot (V1 à V9) après implémentation, ce qui reste à faire et les décisions attendues du propriétaire.

## 0. Périmètre et limites

- https://compleo.work n'est pas joignable depuis l'environnement d'exécution (échec DNS `ENOTFOUND`). L'audit porte sur le code source du dépôt. Aucune capture, aucun Lighthouse, aucune mesure réelle.
- Non vérifié : rendu visuel dans un navigateur (y compris à 360 px de large), performances réelles (LCP, CLS, poids des images), état de la production (elle peut différer du dépôt), contenu réel de la base d'événements.
- Aucune photo d'activité, de guide, du hero, du CTA final ou du login n'est sélectionnée : cela exige la clé `UNSPLASH_ACCESS_KEY` du propriétaire. Seules les 20 photos de villes existent.
- Les comportements « avec photo » ont été vérifiés avec des enregistrements factices temporaires (retirés), des tests de rendu et des builds. Jamais avec de vraies photos.

## 1. Synthèse de l'état final

| Lot | Sujet | État | Dépend de |
|---|---|---|---|
| V1 | Pipeline de sélection | Fait (script, catalogue de 23 emplacements, tests hors ligne). Jamais exécuté contre l'API réelle | Clé API |
| V2 | Composant `Photo`, crédits | Fait | |
| V3 | En-tête partagé, CTA diagnostic | Fait, y compris la barre d'action fixe mobile (`StickyCta`) | |
| V4 | Hero de l'accueil | Fait (cartes exemple, pastilles). Pas de photo : panneau coloré | V1 |
| V5 | Activités | Câblé, repli sur dégradé. Aucune photo | V1 |
| V6 | Onboarding | Câblé, repli sur puces texte. Aucune photo | V1 |
| V7 | Villes | Fait : 20 photos, tuiles sur l'accueil. Couleur moyenne des 20 photos non récupérée | Clé API |
| V8 | Pages secondaires | Câblé (guides, CTA final, login), mentions de réassurance pricing. Images de partage écartées | V1 |
| V9 | Mesure | Fait (`home_view`, `cta_click`). Pas d'A/B | |

Conclusion : le code est prêt à recevoir les photos. Tant que V1 n'est pas exécuté, le site ne gagne visuellement que les 20 photos de villes, le nouvel en-tête, le hero avec cartes exemple et les pastilles. La conversion attendue des photos ne peut pas être évaluée avant leur mise en ligne.

Vérifications à la dernière mise à jour : `npm run typecheck`, `npm run lint`, `npm run build` passent ; 146 tests Vitest et 10 tests Python passent.

## 2. Constats initiaux et suite donnée

Gravité : B bloquant conversion, M majeur, m mineur.

### 2.1 Navigation

| Gravité | Constat | État |
|---|---|---|
| B | Pas d'en-tête partagé : `/pricing`, `/activites/[slug]`, `/login` sans navigation ni CTA | Fait (V3, 13 fichiers). `/login`, `/onboarding` et le tableau de bord gardent volontairement leur écran dédié |
| B | « Connexion » en style primaire concurrençait le CTA diagnostic | Fait : « Connexion » en discret, « Diagnostic gratuit » seul bouton principal |
| M | Pas de CTA fixe sur mobile pour les pages longues | Fait : `StickyCta` sur les fiches activité, activité × ville, activités urbaines, villes et guides (mobile < 768 px, après 400 px de défilement). Non posée sur l'accueil, `/pricing`, le simulateur et les pages d'outils. Rendu et défilement non vérifiés dans un navigateur |
| m | Logo = icône `Rocket` + texte | Non fait (décision propriétaire) |

Limite de l'en-tête : il ne lit pas la session (pour garder les pages statiques). Un utilisateur connecté voit toujours « Connexion » et « Diagnostic gratuit ».

### 2.2 Hero

| Gravité | Constat | État |
|---|---|---|
| B | Illustration abstraite, sans humain ni preuve produit | Partiel (V4) : panneau coloré avec deux cartes « Exemple d'annonce » et « Exemple de calcul » (chiffres issus de `simulate()`, mention IA et « estimation indicative »). La photo humaine dépend de V1 |
| M | Réassurance grisée sous les boutons | Fait : pastilles « Diagnostic gratuit », « Sans inscription », « Sans carte bancaire » |
| M | Aucun élément de confiance visuel | Non fait |
| — | Hero réécrit par ailleurs (« Complément de salaire… près de chez vous »), promesse « 200 € à 1 000 € » retirée avec son avertissement | À arbitrer par la mesure, pas par principe |

`public/images/hero-compleo.svg` n'est plus utilisé (non supprimé).

### 2.3 Corps de l'accueil

| Gravité | Constat | État |
|---|---|---|
| M | Cartes d'aperçu à dégradé | Câblé (V5) : photo `activity:<id>` si présente |
| M | Villes en liste de liens | Fait (V7) : 8 tuiles photo, liste texte pour le reste |
| M | Compteurs décrivant le contenu du site, pas un bénéfice | Fait : `BenefitStats`, quatre repères tirés du code (≈ 79 % du chiffre d'affaires restant après cotisations, seuil de franchise de TVA, « Jusqu'à » le revenu mensuel estimé de l'activité la mieux classée avec la réserve « sans garantie de revenu », annonces IA gratuites par mois). Sources conservées en dessous |
| B | Simulateur d'accueil en paragraphe | Fait : `SimulatorPreview` (barre net / cotisations et trois lignes de montants, valeurs issues de `simulate()` et `TAX_PARAMS`), à côté du texte et du bouton. Rendu non vérifié dans un navigateur |
| m | Guides de l'accueil en texte seul | Non fait (les cartes de `/guides` sont câblées) |
| m | CTA final sans contraste | Câblé (V8) : `PhotoBanner`, repli sur le cadre d'origine |
| m | `parcours-compleo.svg` masqué sous 640 px | Non fait |

### 2.4 Pages de contenu (activité, ville, guide)

| Gravité | Constat | État |
|---|---|---|
| M | Bandeau dégradé sans information | Câblé (V5, V8) : photo d'activité ou de guide, ratio fixe, hauteur plafonnée |
| M | Pas de CTA au-dessus de la ligne de flottaison | Fait : l'en-tête partagé porte le CTA, et `ContentCta` (encart pleine largeur sous l'introduction, une seule action : le diagnostic) figure sur les fiches activité, activité × ville, activités urbaines, villes et guides. Choix : encart en ligne plutôt que colonne latérale, pour garder la même mise en page à toutes les largeurs. Rendu non vérifié dans un navigateur |
| m | Tableaux de revenu sans visualisation | Fait : `IncomeRangeBar` dans le tableau de `/activites/[slug]` (fourchette min–max sur une échelle commune aux cinq lignes, décorative, montants conservés en texte). Les fiches activité × ville et urbaines n'ont pas ce tableau. Rendu non vérifié dans un navigateur |

### 2.5 Pricing et login

| Gravité | Constat | État |
|---|---|---|
| M | Aucune réassurance visuelle | Partiel (V8) : « Paiement géré par Stripe », « Abonnements résiliables à tout moment », reprises de ce que la page affirme déjà. Rien sur la rétractation (l'achat impose d'y renoncer) |
| M | Offre recommandée à surligner | Non fait (décision propriétaire) |
| M | Login sans rappel de la promesse | Câblé (V8) : colonne photo à partir de 1024 px, rien sur mobile. Sans photo, page inchangée. Pas de puces de promesse |

### 2.6 Onboarding

Câblé (V6) : l'étape « Qu'aimez-vous faire ? » affiche des cartes photo pour les domaines disposant d'une photo (celle de la première activité de la catégorie), les autres restent des puces. Les 3 recommandations affichent la photo de l'activité. Constat annexe corrigé : la page `/onboarding` était passée de 7,07 à 10,7 kB (First Load JS 116 → 120 kB) parce que `Photo` tirait les données JSON des photos de villes dans le bundle client. Les utilitaires purs sont maintenant dans `src/lib/unsplash.ts` (`city-images.ts` les réexporte) : 8,26 kB et 117 kB mesurés au build. Les ~1,2 kB restants correspondent au composant `Photo` et au code des cartes. Le comportement au clic (sélection, étapes) n'a pas été vérifié dans un navigateur.

### 2.7 Accessibilité et performance

| Point | État |
|---|---|
| Contraste du texte sur photo | Voile sombre sur le CTA final ; à mesurer sur une vraie photo (ratio ≥ 4,5:1) |
| Visuels décoratifs `alt=""`, photos de villes avec `alt` « Vue de {ville} » | Fait |
| `srcset` sans copie de l'image | Fait : `<img>` + `srcSet` 320 à 1280 px, recadrage par le CDN, WebP, qualité 60 (le chargeur `next/image` proposé initialement n'est plus nécessaire) |
| Ratio réservé (pas de CLS), `priority` pour l'image du haut, `loading="lazy"` ailleurs | Fait |
| Fond avant chargement | Prévu (`color`), absent des 20 photos de villes tant que `colors` n'a pas été exécuté |
| Budgets (hero ≤ 120 Ko mobile, LCP ≤ 2,5 s, CLS ≤ 0,1, Lighthouse accessibilité ≥ 95) | Non mesurés |
| `prefers-reduced-motion` | Aucun effet animé ajouté |

## 3. Ce qui a été livré, par lot

### V1 : pipeline de sélection
`scripts/fetch-unsplash-images.py` (remplace `fetch-city-images.py`) : périmètres `cities` et `site`, commandes `search`, `build`, `colors`, `check`. Catalogue de requêtes `scripts/site-images-catalogue.json` : `hero:home`, `cta:final`, `login`, 10 activités, 4 activités urbaines publiées, 6 guides (23 emplacements). Un test Vitest vérifie que le catalogue couvre exactement les activités, activités urbaines publiées et guides du code. Le build lit les métadonnées dans les candidats (une requête par photo) et reprend après un arrêt de quota. Tests Python hors ligne avec API simulée : `python3 -B -m unittest scripts/test_fetch_unsplash_images.py`. Fichier compilé `.pyc` retiré du dépôt, `__pycache__/` ignoré.

### V2 : fondations
`Photo` (`src/components/marketing/photo.tsx`) : ratio, `srcset`, `sizes`, `priority`, voile, contenu superposé, crédit `caption`, `overlay`, `text` (sans lien, pour une photo dans un lien) ou `page`, repli, option `phrasing` pour un bouton ou un lien. Ratios : bandeau 2,5, hero 4:3, carte 3:2, tuile 1:1, large 16:9, portrait 4:5. `PhotoCredits` et page `/credits-photos` (noindex, hors sitemap, liée au pied de page).

### V3 : navigation
`SiteHeader` partagé sur 13 fichiers, composant statique. `StickyCta` : barre fixe en bas d'écran sous 768 px, apparaît après 400 px de défilement, masquée et non atteignable au clavier tant qu'elle est cachée, espace réservé en fin de page, zone de sécurité iPhone prise en compte, mesurée par `cta_click` (`source` `sticky`).

### V4 : hero
`HeroShowcase`, emplacement `hero:home` dans `src/data/site-images.json`.

### V5 : activités
`ActivityVisual` et photos `activity:<id>` (accueil, `/activites`, `/activites/[slug]`, tuiles de `/villes/[ville]`), photos `urban:<slug>` sur les cartes et fiches urbaines.

### V6 : onboarding
Voir 2.6.

### V7 : villes
Tuiles de villes sur l'accueil (8), champ `color` géré (type, fond avant chargement, script).

### V8 : pages secondaires
Guides (`guide:<slug>`), `PhotoBanner` (`cta:final`), colonne du login (`login`), deux mentions de réassurance sur `/pricing`.

### V9 : mesure
Événements `home_view` (propriété `visual` : `photo` ou `none`) et `cta_click` (`source` : header, hero, final, sticky, encart, page ; `target` : diagnostic, simulateur, login). `TrackedLink`, `HomeViewTracker`. Les signaux « Do Not Track » et « Global Privacy Control » désactivent toujours l'envoi. Le README décrit les événements et une requête SQL de comparaison avec et sans photo. Seules les vues de l'accueil sont comptées. Un clic n'est pas rattaché à une visite : le rapport clics sur vues est approximatif.

## 4. Conformité aux directives de l'API Unsplash

| Exigence | État |
|---|---|
| Hotlink `images.unsplash.com`, aucune copie dans le dépôt | Respecté (balise `<img>`) |
| Déclaration du téléchargement par photo retenue | Dans `build` ; jamais exécuté pour le périmètre `site` ; fait pour les villes |
| Crédit photographe + Unsplash avec `utm_source=compleo&utm_medium=referral` | Légende liée sous le bandeau ; texte sans lien sur les cartes et tuiles (la carte est déjà un lien), crédit lié sur `/credits-photos` ; test automatisé de présence des UTM |
| Mode demo limité à 50 requêtes par heure | Géré par le script (arrêt avant épuisement, reprise). `search site` et `build site` demandent chacun 23 requêtes : à lancer à une heure d'intervalle |
| Passage en mode production avant lancement public | À demander par le propriétaire |
| Pas de suggestion de parrainage, pas de photo de personne en contexte sensible | Critères de sélection dans le README |

Écart assumé : les crédits sans lien sur les cartes, les tuiles de 56 px (aucun crédit en ligne) et les fonds décoratifs renvoient à `/credits-photos`. À trancher si une lecture stricte exige un crédit lié partout.

Images de partage (OG) non faites : incorporer une photo dans un PNG statique généré au build revient à la copier, contraire au hotlink. Les cartes OG actuelles (texte sur dégradé) sont inchangées. Décision propriétaire.

## 5. Actions restantes, dans l'ordre

1. Propriétaire : fournir `UNSPLASH_ACCESS_KEY` (variable locale, jamais dans le dépôt).
2. `python3 scripts/fetch-unsplash-images.py search site`, ouvrir `data/unsplash/site-candidates.html`, corriger `scripts/site-images-selection.json`, `check site`.
3. Une heure plus tard : `build site`, `check site`, commiter `src/data/site-images.json` et la sélection.
4. `python3 scripts/fetch-unsplash-images.py colors` (périmètre des villes, environ 20 requêtes) pour le fond avant chargement.
5. Relire visuellement les 20 photos de villes (cas à regarder : Villeurbanne, Saint-Denis de La Réunion, Toulon, Le Havre ; deux photos du même photographe pour Dijon et Lille).
6. Lancer Lighthouse mobile avant et après sur l'accueil, une page activité, une page ville, `/onboarding` : LCP, CLS, poids des images.
7. Vérifier à la main dans un navigateur (360 px et ≥ 1024 px) : superposition des deux cartes du hero, lisibilité du CTA final sur photo, colonne photo du login, cartes de l'onboarding.
8. Tous les points de l'audit sont traités ou dépendent des étapes 1 à 7 ci-dessus (clé API, mesures, vérifications dans un navigateur) ou des décisions de la section 6.

## 6. Décisions requises du propriétaire

- Clé `UNSPLASH_ACCESS_KEY` et passage de l'application en mode production.
- Validation des photos retenues (cohérence de marque, personnes identifiables).
- Crédits : accepter les crédits sans lien sur les cartes et tuiles, ou exiger un crédit lié partout.
- Images de partage avec photo : renoncer, ou accepter le risque lié à la copie.
- Promesse de revenu dans le hero (retirée) : arbitrer par test A/B ou par période de comparaison.
- Offre à mettre en avant sur `/pricing`, et logo (aujourd'hui icône `Rocket` + texte).

## 7. Risques

- Photo hotlinkée retirée ou indisponible : le repli sur dégradé évite la page cassée ; un contrôle périodique des URL reste à prévoir (la commande `check` vérifie le format, pas la disponibilité).
- Photos de stock perçues comme génériques : la preuve produit (cartes du hero) compense, mais pas d'effet mesuré à ce jour.
- Poids des images : à tenir sous les budgets du 2.7, sinon la conversion mobile baisse malgré le gain visuel.
- Aucun faux témoignage, aucun compteur d'utilisateurs, aucune photo présentée comme client réel : règle de sélection à rappeler à chaque nouvelle photo.
- Mesure : sans identifiant, pas de lien entre clic et visite ; sans volume de trafic connu, aucune conclusion statistique garantie.

## 8. Mesure du gain

- Référence à relever avant la mise en ligne des photos : taux de clic du CTA du hero (`cta_click` source `hero` sur `home_view`), taux de démarrage et d'achèvement du diagnostic, inscriptions, LCP et CLS mobiles.
- Comparer sur des périodes de même durée et de trafic comparable, avec la propriété `visual` (`none` avant, `photo` après). Un A/B 50/50 n'est pas implémenté.
- Critère de conservation d'un lot : pas de dégradation du LCP mobile au-delà de 10 % et taux de clic du CTA en hausse ou neutre.
