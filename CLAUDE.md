# Instructions Claude Code : gestion des tâches Compléo

Cible : dépôt `girardmaxime33000/Compl-o` (Next.js 14, Supabase, Stripe, Vercel AI SDK).
Objectif : générer du revenu rapidement via conversion, puis SEO. Ce fichier se place à la racine du dépôt sous le nom `CLAUDE.md`, ou se colle comme premier message de session.

---

## 1. Règles générales

- Langue du produit, des commentaires utilisateur et des messages de commit : français pour l'UI, Conventional Commits en anglais pour git (`feat:`, `fix:`, `chore:`, `docs:`).
- Une tâche = une branche `claude/<id-tâche>-<slug>` = une PR. Ne jamais pousser sur `main`.
- Ne pas créer de PR sans demande explicite.
- Ne jamais commiter : `.env*`, clés, binaires, données personnelles.
- Ne jamais inventer de chiffres marketing (utilisateurs, avis, ancienneté, revenus garantis). Utiliser uniquement des données réelles ou des formulations conditionnelles (« estimation », « jusqu'à »).
- Ne pas copier textes, visuels ou marque de pap.fr. Reprendre uniquement les patterns structurels.
- Les droits Premium et quotas restent vérifiés côté serveur.
- Taux et plafonds fiscaux : uniquement dans `src/lib/tax.ts`, avec source et date de vérification en commentaire.
- Avant de déclarer une tâche terminée : `npm run typecheck`, `npm run lint`, `npm run build` doivent passer. Si un test existe pour le code touché, l'exécuter. Rapporter honnêtement tout échec ou toute vérification non faite.

## 2. Procédure de gestion des tâches

1. Lire `TASKS.md` à la racine (le créer depuis la section 4 s'il n'existe pas).
2. Choisir la première tâche au statut `todo` dont les dépendances sont `done`.
3. Utiliser TaskCreate/TaskUpdate pour suivre les sous-étapes de la tâche courante : `in_progress` au démarrage, `completed` à la fin. Une seule tâche `in_progress` à la fois.
4. Avant de coder : lire les fichiers concernés, lister les fichiers à modifier, vérifier les critères d'acceptation.
5. Implémenter le minimum nécessaire aux critères. Pas de refactor hors périmètre.
6. Vérifier (section 1), puis mettre à jour `TASKS.md` : statut, date, branche, résultat des vérifications, points non vérifiés.
7. Commit sur la branche de la tâche, push avec `git push -u origin <branche>`.
8. Si une décision relève du propriétaire (prix, texte juridique, nom de domaine, clés API, choix de fournisseur), s'arrêter sur cette tâche, la marquer `blocked` avec la question exacte, passer à la suivante indépendante.
9. Ne jamais marquer `done` sans que tous les critères d'acceptation soient vérifiés.

Format d'une entrée `TASKS.md` :

```
### T01 Titre
- statut: todo | in_progress | blocked | done
- dépend de: T00
- branche:
- critères d'acceptation:
- vérifications faites / non faites:
- notes:
```

## 3. Définition de terminé (commune)

- Critères d'acceptation vérifiés un par un.
- Typecheck, lint, build verts.
- Aucune régression sur : connexion, onboarding, génération d'annonce avec quota, facturation PDF, webhook Stripe.
- Aucune clé ni donnée personnelle dans le diff.
- `README.md` mis à jour si variables d'environnement, routes ou comportement changent.

## 4. Backlog ordonné

### Phase 0 : prérequis d'encaissement (bloquants)

**T01 Mentions légales**
- Compléter `src/lib/legal.ts`. Les valeurs (statut, adresse, SIRET, TVA, e-mail, médiateur) viennent du propriétaire : si absentes, `blocked` avec la liste des champs manquants.
- Critère : aucun champ vide ou placeholder visible sur `/mentions-legales`.

**T02 CGU / CGV / confidentialité**
- Créer `/cgu`, `/cgv`, `/confidentialite`, liées dans le footer et l'écran de paiement.
- CGV : droit de rétractation 14 jours, renonciation expresse pour contenu numérique à l'activation, résiliation, médiateur de la consommation.
- Case à cocher d'acceptation avant Stripe Checkout, validée côté serveur.
- Marquer les textes comme brouillon à faire relire par un juriste. Ne pas les présenter comme validés.

**T03 Déploiement production**
- Vercel, variables d'environnement, `NEXT_PUBLIC_SITE_URL` définitif, redirections Supabase, webhook Stripe de production, Stripe en mode live, fournisseur d'IA hébergé (Groq ou autre).
- Étapes nécessitant des accès du propriétaire : produire une checklist précise et marquer `blocked` pour ces seules étapes.

### Phase 1 : conversion (revenus à court terme)

**T04 Simulateur public**
- Déplacer le simulateur vers une route publique indexable (`/simulateur-micro-entrepreneur`), sans authentification.
- Calcul inchangé, import depuis `src/lib/tax.ts`.
- Porte d'inscription : sauvegarde de la simulation et export PDF réservés aux comptes.
- Critères : accessible déconnecté, métadonnées propres, bandeau « estimation indicative, ne constitue pas un conseil fiscal ».

**T05 Modèle de facture et devis public**
- Page publique `/modele-facture-auto-entrepreneur` avec aperçu ; création et téléchargement PDF après inscription. Mention « TVA non applicable, art. 293 B du CGI » conservée.

**T06 Générateur d'annonce : démo publique**
- Démonstration sans compte (un exemple pré-généré par activité, pas d'appel IA anonyme non borné). Si appel IA anonyme : limitation par IP/cookie côté serveur et plafond global journalier.

**T07 Paywall et offres**
- Paywall au moment de valeur : 3e annonce du mois, export PDF de simulation.
- Ajouter un pack ponctuel (Stripe Checkout `mode: payment`) et un tarif annuel (`mode: subscription`, prix annuel). Les montants viennent du propriétaire : utiliser des variables d'environnement `STRIPE_*_PRICE_ID`, pas de prix en dur.
- Limiter les factures gratuites si le propriétaire le décide : `blocked` sur cette décision.
- Webhook Stripe : gérer `checkout.session.completed` pour le paiement ponctuel (crédits d'annonces), idempotence par `event.id`.
- Migration SQL additive, RLS conservée, colonnes de droits modifiables uniquement par le service role.

**T08 Onboarding vers inscription**
- Le diagnostic (`/onboarding`) montre les 3 recommandations avant demande d'e-mail. Mesurer l'entonnoir (T12).

### Phase 2 : SEO technique

**T09 Fondations SEO**
- `generateMetadata` sur chaque page publique : titre unique `Promesse | Compléo`, description unique, canonical, Open Graph, images OG dynamiques.
- `src/app/sitemap.ts`, `src/app/robots.ts`. `noindex` sur `/dashboard`, `/login`, `/auth`, `/onboarding`.
- JSON-LD : `Organization`, `SoftwareApplication` (offres), `BreadcrumbList`.
- Critères : validation du JSON-LD, sitemap accessible, aucune page privée indexable, Lighthouse (SEO, performance) relevé avant/après.

**T10 Pages activité**
- `/activites/[slug]` pour les 9 activités du catalogue `src/lib/activities.ts` : tarif moyen, revenu estimé selon le temps, plateformes, exemple d'annonce, simulation pré-remplie, CTA vers l'outil. Source unique : `activities.ts`.

**T11 Pages activité × ville (programmatique)**
- `/activites/[slug]/[ville]` en génération statique/ISR, limité à une liste validée de villes (démarrer à 20).
- Chaque page doit contenir au moins un élément de donnée propre à la ville. Sans donnée distincte vérifiable, ne pas générer la page (contenu mince). Si aucune source de données locale n'est disponible : `blocked`, proposer les sources possibles.
- Maillage : villes voisines, activités proches, retour vers l'outil.

### Phase 3 : mesure, contenu, rétention

**T12 Mesure**
- Analytics respectueux de la vie privée (consentement si traceurs non exemptés), événements : vue simulateur, simulation terminée, inscription, annonce générée, clic paywall, checkout démarré, paiement réussi.
- Aucun envoi de données personnelles aux outils d'analyse.

**T13 Guides éditoriaux**
- 6 guides : cumul chômage/micro-entreprise, franchise de TVA, plafonds 2026, premier devis, activité complémentaire pour retraité, annonces efficaces. Structure : réponse courte en tête, sections H2, date de mise à jour, source officielle citée, CTA vers l'outil.
- Chiffres tirés de `tax.ts`, jamais dupliqués en dur dans le texte.

**T14 E-mail et rétention**
- Envoi des factures par e-mail, séquence d'onboarding, alerte de proximité du plafond de chiffre d'affaires.
- Fournisseur d'e-mail : décision du propriétaire.

**T15 RGPD**
- Suppression de compte et export des données.

**T16 Tests**
- Tests unitaires de `tax.ts` et `activities.ts`, test du quota d'annonces, test du webhook Stripe (signature invalide, idempotence).

## 5. Garde-fous marketing et légal

- Promesse de revenu (« 200 € à 1 000 € par mois ») : toujours accompagnée de « estimation selon profil et temps disponible ».
- Aucun faux avis, faux compteur, fausse urgence.
- Mention « annonce générée par IA, à relire avant publication » maintenue.
- Tout contenu juridique ou fiscal porte la date de vérification et un renvoi aux sources officielles (urssaf.fr, service-public.fr).

## 6. Rapport de fin de tâche (format imposé)

```
Tâche: T__
Branche / commit:
Fait:
Vérifié (commandes et résultats):
Non vérifié:
Bloqué / décision requise du propriétaire:
Fichiers modifiés:
```
