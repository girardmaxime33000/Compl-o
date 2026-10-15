# Déploiement et maintenance : guide d'exploitation de Compléo

Date : 2026-10-16. À relire à chaque changement d'hébergeur, de fournisseur ou de processus. Les points marqués « décision propriétaire » ne peuvent pas être tranchés par le code.

## 1. État constaté (à corriger en premier)

| Constat | Risque | Action |
|---|---|---|
| Vercel traite la branche `claude/new-session-og6dhq` comme **Production** : chaque push y déploie sur `compleo.work` (liste des déploiements du 2026-10-16) | Un changement non testé part en ligne dès le push, sans relecture | Régler la « Production Branch » sur une branche stable (section 2) |
| Aucune intégration continue : la seule vérification visible sur les PR est « Vercel Preview Comments » | Rien n'empêche de fusionner un build cassé ou un test rouge | Workflow `.github/workflows/ci.yml` ajouté ; en faire une vérification obligatoire (section 3) |
| Alerte critique `npm audit` sur `next` 14.2.35 | Déni de service possible | Migration prête : [PR #4](https://github.com/girardmaxime33000/Compl-o/pull/4), à valider sur prévisualisation (`docs/migration-next-16.md`) |
| Plan Vercel « Hobby » | Usage commercial interdit par les conditions Hobby ; cron limité à une exécution par jour ; pas de contournement de protection garanti | Passer au plan Pro avant le lancement commercial (décision propriétaire, à vérifier dans les conditions Vercel en vigueur) |
| Aucune supervision ni sauvegarde documentée | Panne ou perte de données découverte par les clients | Sections 6 et 7 |

## 2. Environnements et branches

| Environnement | Source | URL | Données et clés |
|---|---|---|---|
| Production | branche de production (à définir, voir ci-dessous) | `compleo.work` | Supabase de production, Stripe live, e-mail réel |
| Preview | toute autre branche et toute PR | `compl-o-git-<branche>-maxime33s-projects.vercel.app` (protégée par Vercel Authentication) | Supabase de test, Stripe **mode test**, aucune clé de production |
| Local | `npm run dev` | `localhost:3000` | `.env.local` hors dépôt, projet de test |

**Règles de branches (décision propriétaire à valider) :**
1. Une branche stable (par exemple `main`, ou la branche par défaut actuelle `claude/trusting-archimedes-bm4hqh`) est la seule « Production Branch » : Vercel > Settings > Git > Production Branch.
2. Le travail se fait sur des branches `claude/<id>-<slug>`, une PR par sujet (CLAUDE.md). Les branches de travail ne déploient qu'en Preview.
3. Protection de branche GitHub (Settings > Branches) sur la branche stable : PR obligatoire, vérification `CI / verify` obligatoire, branche à jour avant fusion, pas de push direct.
4. Fusion en « squash » ou « merge » : au choix, mais jamais de réécriture d'historique sur la branche stable.

Tant que la branche de production n'a pas été changée, tout push sur `claude/new-session-og6dhq` met le site en ligne : ne poussez rien de non testé dessus.

## 3. Intégration continue

`.github/workflows/ci.yml` s'exécute sur chaque PR et sur chaque push de branche `claude/**` :

- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` (valeurs factices : aucune clé réelle, aucun appel externe) ;
- tests Python du script Unsplash (API simulée) ;
- `npm audit --omit=dev --audit-level=high` dans un job séparé **informatif** (ne bloque pas).

À faire côté GitHub : Settings > Branches > règle sur la branche stable > « Require status checks » > cocher `verify` (et laisser `audit` facultatif). Un premier passage du workflow doit avoir eu lieu pour que la vérification soit proposée.

Aussi ajoutés : `.github/dependabot.yml` (mises à jour hebdomadaires groupées, montées majeures de `next`, `react`, `tailwindcss`, `eslint` et `typescript` ignorées : ce sont des migrations à planifier), `.github/CODEOWNERS` (zones sensibles : paiement, authentification, base, taux fiscaux), `.github/pull_request_template.md`.

## 4. Procédure de déploiement

**Changement courant**
1. Branche de travail, développement, `npm run typecheck && npm run lint && npm test && npm run build` en local.
2. Push, PR, CI verte, prévisualisation Vercel « Ready ».
3. Contrôle sur la prévisualisation des pages touchées (et du parcours concerné s'il touche authentification, paiement, PDF ou e-mail).
4. Fusion dans la branche stable : Vercel déploie en production automatiquement.
5. Vérification dans les 10 minutes : `/api/health` répond `{"status":"ok","env":"production","commit":"<sha>"}` avec le bon commit, accueil et `/pricing` s'affichent, aucune erreur dans Vercel > Logs.

**Migration de base de données** (`supabase/migrations/NNNN_*.sql`) : jamais appliquée automatiquement. Ordre : (1) sauvegarde (section 7), (2) appliquer sur le projet de test, tester, (3) appliquer en production **avant** le déploiement du code qui en dépend, (4) migrations additives et rétrocompatibles (CLAUDE.md : RLS conservée, colonnes de droits modifiables par le service role seulement).

**Retour arrière** : Vercel > Deployments > déploiement précédent sain > ⋯ > « Promote to Production » (instantané, sans reconstruction). Un retour arrière de code ne défait pas une migration de base : concevoir les migrations pour que l'ancien code continue de fonctionner. Après retour arrière, ouvrir une PR de correction ; ne pas réécrire l'historique.

## 5. Variables d'environnement

- Liste complète et rôle de chaque variable : `docs/preview-env-checklist.md` et `.env.example`.
- Contrôle automatisé : `npm run check:env -- --env production --file <fichier>` (ou en lisant les variables du shell). Il échoue si une variable requise manque, si une clé Stripe **live** se trouve hors production, si une adresse `localhost` est utilisée en ligne ou si un secret porte le préfixe `NEXT_PUBLIC_`. Pour un environnement Vercel : `vercel env pull .env.check --environment=preview`, puis le script, puis supprimer le fichier.
- Les variables `NEXT_PUBLIC_*` sont figées à la construction : tout changement impose un redéploiement.
- Les secrets sont « Sensitive » dans Vercel, jamais commités, jamais collés dans une PR ou un ticket.
- **Rotation** : à chaque départ d'une personne ayant eu accès et au moins une fois par an : clé de service Supabase, secret et clé Stripe, secret de webhook, clé IA, clé Resend, `CRON_SECRET`. Procédure : créer la nouvelle valeur, la mettre dans Vercel, redéployer, vérifier, révoquer l'ancienne.

## 6. Supervision

| Quoi | Comment | Fréquence |
|---|---|---|
| Disponibilité | Sonde externe gratuite (UptimeRobot, Better Stack…) sur `https://compleo.work/api/health`, alerte e-mail après 2 échecs | 5 min |
| Erreurs d'exécution | Vercel > Logs (filtre « Error ») ; Vercel > Settings > Alerts si disponible sur le plan | Quotidien au lancement, puis hebdomadaire |
| Webhook Stripe | Stripe > Développeurs > Webhooks : taux d'échec ; alerte e-mail Stripe en cas d'échecs répétés | Hebdomadaire |
| E-mail | Resend > tableau de bord : rebonds, plaintes, domaine vérifié | Hebdomadaire |
| Cron des e-mails | Vercel > Cron Jobs : dernière exécution réussie (une par jour, 08:00 UTC) | Hebdomadaire |
| Entonnoir | Requêtes SQL du README (« Mesure d'audience ») | Hebdomadaire |
| Performance | Lighthouse mobile sur accueil, une activité, une ville, `/onboarding` : LCP ≤ 2,5 s, CLS ≤ 0,1, accessibilité ≥ 95 | Mensuelle et après chaque lot visuel |
| Photos Unsplash | `npm run check:photos` (requête HEAD par photo, sans clé) : détecte une photo retirée par son auteur | Mensuelle |

`/api/health` ne touche ni la base ni un service externe : elle prouve que l'application répond, pas que Supabase ou Stripe fonctionnent. Surveiller ces dépendances par leurs propres pages d'état.

## 7. Données et sauvegardes

- **Supabase** : vérifier le plan du projet. Les sauvegardes quotidiennes automatiques et la restauration à un instant donné dépendent du plan : vérifier dans Supabase > Database > Backups ce qui est réellement actif. Avec le plan gratuit, prévoir un export manuel (`pg_dump`) hebdomadaire stocké hors Supabase et chiffré.
- **Test de restauration** : une fois par trimestre, restaurer une sauvegarde dans un projet de test et vérifier que l'application s'y connecte. Une sauvegarde jamais restaurée n'est pas une sauvegarde.
- **Analytics** (`analytics_events`) : données anonymes, sans identifiant. Conserver au plus 13 mois : purge mensuelle `delete from analytics_events where created_at < now() - interval '13 months';` (à planifier avec `pg_cron` ou à lancer à la main).
- **RGPD** : suppression de compte et export des données existent (`/dashboard/account`) ; tester chaque trimestre avec un compte de test. Le registre des traitements et les textes juridiques restent à faire relire par un juriste (CGU, CGV, confidentialité : brouillons).
- **Données de villes** : régénération documentée dans le README (« Données locales »), à relire chaque année quand France Travail publie le nouveau millésime BMO.

## 8. Calendrier de maintenance

| Quand | Tâche |
|---|---|
| Chaque semaine | Revue des PR Dependabot (fusion des mises à jour mineures groupées après CI verte et prévisualisation) ; vérification des alertes Vercel, Stripe, Resend |
| Chaque mois | `npm audit` ; `npm run check:photos` ; Lighthouse ; contrôle du cron ; revue des événements d'entonnoir |
| Chaque trimestre | Test de restauration Supabase ; test de suppression et d'export de compte ; rotation si nécessaire ; revue des accès (Vercel, GitHub, Supabase, Stripe, Resend) |
| **Chaque 1er janvier** | **Mise à jour des taux et plafonds fiscaux** : suivre la procédure du README (« Mise à jour annuelle » du catalogue d'activités urbaines) et `src/lib/tax.ts` (relire les fiches Service Public listées en tête du fichier, mettre à jour les dates de vérification, ajouter l'année dans `FISCAL_PARAMS_BY_YEAR`, `npm test`). Mettre à jour aussi les guides datés (`plafonds-micro-entreprise-2026`, franchise de TVA) et les textes « 2026 » de l'interface |
| Chaque année | Relecture juridique des CGU, CGV, confidentialité, mentions légales ; renouvellement du domaine (vérifier la date d'expiration et le renouvellement automatique) ; revue des prix Stripe |
| À chaque version majeure de Node | Vérifier la version de Node du projet Vercel (Settings > Build and Deployment) : fin de support des versions LTS à surveiller |

## 9. Incident : marche à suivre

1. **Constater** : la sonde ou un utilisateur signale une panne. Ouvrir Vercel > Logs et Deployments.
2. **Si un déploiement récent est en cause** : retour arrière immédiat (« Promote to Production » sur le déploiement précédent sain). Ne pas diagnostiquer en production avant d'avoir rétabli.
3. **Si c'est une dépendance** : état de Supabase, Stripe, Resend, du fournisseur d'IA, de Vercel (pages d'état). Les fonctions dépendantes peuvent être dégradées sans arrêter le site (e-mails et IA échouent proprement).
4. **Paiement** : après toute panne du webhook, rejouer les événements manqués depuis Stripe > Webhooks (l'idempotence par identifiant d'événement évite les doubles crédits).
5. **Clôture** : note datée dans `TASKS.md` ou un ticket (cause, durée, correction, action de prévention), PR de correction avec test qui reproduit le défaut.

## 10. Sécurité courante

- En-têtes de sécurité en place (`next.config.mjs`). Pas de CSP : demande un inventaire des sources (Stripe, Supabase, `images.unsplash.com`) puis un déploiement en mode « report-only » avant application.
- Droits Premium, quotas et colonnes sensibles contrôlés côté serveur ; clé de service Supabase uniquement côté serveur.
- Signature des webhooks Stripe vérifiée ; routes cron protégées par `CRON_SECRET`.
- Dépendances : Dependabot + `npm audit` ; les montées majeures sont des migrations planifiées (Tailwind 4 pour les alertes de build restantes).
- Accès : authentification à deux facteurs sur GitHub, Vercel, Supabase, Stripe, Resend et le registrar du domaine ; comptes nominatifs, pas de partage de mot de passe.

## 11. Décisions propriétaire en attente

1. Branche de production et protection de branche (section 2).
2. Passage au plan Vercel Pro avant le lancement commercial.
3. Calendrier de la migration Next 16 (PR #4) après jeu de tests sur prévisualisation.
4. Outil de supervision externe et destinataire des alertes.
5. Plan Supabase (sauvegardes, restauration) et lieu de stockage des exports.
6. Relecture juridique des textes et registre RGPD.
