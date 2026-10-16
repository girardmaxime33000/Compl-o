# Blog : dossier de relecture avant publication

État au 16 octobre 2026. **Les 7 articles ont été relus et publiés le 16 octobre 2026** (`reviewedOn` renseigné). Ce dossier garde la trace de la relecture ; la suite décrit la règle qui s'applique à tout nouvel article. Avant la relecture, aucun n'était public : sans `reviewedOn`, un article reste en `noindex` et absent du sitemap, de `/blog`, des pages catégorie, du flux RSS, de `llms.txt` et des newsletters. Ce dossier liste, article par article, ce qu'il faut vérifier (relecture ciblée : chiffres, juridique, sources) avant de publier. Les listes de chiffres ont été extraites du rendu réel des articles ; elles se régénèrent si le code change (voir « Mise à jour »).

## Publier un article

1. Relire l'article sur son URL de prévisualisation `/blog/<slug>` (accessible mais en `noindex`).
2. Dans `src/lib/blog.ts`, ajouter `reviewedOn: "AAAA-MM-JJ"` (date de la relecture) à l'entrée de l'article. Mettre aussi `updated` à jour si le texte a changé.
3. `npm run typecheck && npm run lint && npm test && npm run build`, puis déployer.
4. La page de l'article affiche alors « Chiffres et sources relus le … ». N'ajouter `reviewedOn` que si la relecture a réellement eu lieu.

Retirer un article : supprimer `reviewedOn` (il repasse en `noindex` et sort du sitemap, du RSS et des listes).

## Contrôles communs aux articles chiffrés

Tous les montants fiscaux viennent de `src/lib/tax.ts` (jamais écrits dans le texte). À rapprocher de la fiche officielle « Régime micro-social » (<https://entreprendre.service-public.gouv.fr/vosdroits/F37353>, vérifiée le 21 février 2026 d'après les guides, non rouverte par l'assistant) :

| Valeur | Où elle est lue | Utilisée dans |
|---|---|---|
| 21,2 % (services BIC) | `TAX_PARAMS.urssafRate.bic` | 5 articles |
| 25,6 % (BNC non réglementés) | `TAX_PARAMS.urssafRate.bnc` | 5 articles |
| 12,3 % (vente de marchandises) | `TAX_PARAMS.urssafRateSales` | calculer-net-micro-entrepreneur |
| 37 500 € (franchise de TVA, services) | `TAX_PARAMS.vatThreshold` | premiers-pas, calculer-net |
| 83 600 € (plafond micro, services) | `TAX_PARAMS.microCeilingServices` | premiers-pas, calculer-net |

Points de méthode à valider une fois pour toutes :

- **Répartition BIC / BNC des activités** : elle vient de `regimeOf` (catégories cours, cours de langue, informatique = BNC ; le reste = BIC), « d'après les repères du simulateur », pas d'une fiche officielle.
- **Dépôt-vente** : classé BIC services dans le simulateur alors que la vente de marchandises relève d'un autre taux. Il est volontairement exclu des calculs des articles avec un renvoi à l'Urssaf. Le simulateur lui-même reste à corriger si vous le décidez.
- **60 % de temps facturable** (`BILLABLE_RATIO`) : hypothèse de `activities.ts`, non sourcée. Présentée comme « hypothèse de calcul ».
- **Tarifs du catalogue** : présentés comme « repères indicatifs communs à la France » ; aucune donnée de prix par ville n'existe. La formule « tarif moyen constaté en France » des pages activité n'a pas de source dans le dépôt.
- **Exemples** (300 / 600 / 1 000 € par mois, objectif de 300 €, paquets, abonnements) : fictifs, signalés comme tels dans le texte.

## Vérification des sources faite le 16 octobre 2026 (par l'assistant)

Pages rouvertes et relues le jour même sur service-public.gouv.fr. Cette vérification complète votre relecture sans la remplacer ; les articles ont été publiés après votre accord.

| Point | Résultat |
|---|---|
| Taux micro-social 2026 (fiche F37353, vérifiée le 21 février 2026) | **Conforme** : 12,3 % (vente), 21,2 % (prestation de services BIC), 25,6 % (professions libérales non réglementées hors Cipav). La fiche n'a pas de ligne « prestations de services BNC » : les articles disent désormais « professions libérales non réglementées hors Cipav, qui relèvent des BNC ». La Cipav (23,2 %) n'est pas traitée. |
| Franchise de TVA 2026 (F21746, vérifiée le 1er janvier 2026) | **Conforme** : 37 500 € (services), seuil majoré 41 250 €, inchangés pour 2026. |
| Plafond micro 2026 (F32353, vérifiée le 21 février 2026) | **Conforme** : 83 600 € (prestations de services et activités libérales), 203 100 € (vente). Un dépassement pendant deux années consécutives fait basculer au régime réel ; les articles ne détaillent pas ce point. |
| DLC / DDM (F10990, vérifiée le 6 février 2026) | **Conforme** : définitions, mentions et seuils de précision de la DDM (moins de 3 mois, 3 à 18 mois, plus de 18 mois). |
| Prix à l'unité (F34344, vérifiée le 2 juillet 2024, toujours cette date) | **Conforme**. |
| Shrinkflation | **Corrigé** dans l'article : la durée est de deux mois **à compter de la mise en vente de la quantité réduite** (et non « les deux premiers mois de commercialisation du produit »), et la règle vise les **supermarchés de plus de 400 m² à prédominance alimentaire**. Autre information non reprise dans l'article : un arrêté du 28 juin 2024 étend l'obligation aux lots dont le nombre d'unités diminue ; et les sites de vente à distance seraient hors champ (source secondaire, texte non lu). Aucune modification de l'arrêté du 16 avril 2024 trouvée pour 2025 ou 2026 (recherche, pas lecture de Légifrance). |
| Résiliation en 3 clics | Parcours conforme à l'actualité A16599 (septembre 2023). Le texte de loi (article L215-1-1 du code de la consommation) et la date d'application (1er juin 2023 pour les contrats futurs, d'après une source secondaire) n'ont pas été relus sur Légifrance : l'article ne cite pas de date. **À noter** : une recherche indique qu'un bouton « renoncer au contrat ici » est exigé sur les sites depuis le 19 juin 2026 pour le droit de rétractation (distinct de la résiliation). Non vérifié sur le texte, non repris dans l'article. |

Non vérifié par l'assistant : le texte de l'arrêté du 16 avril 2024 et de l'article L215-1-1 sur Légifrance, la fiche F22486 (téléphonie et internet), l'exactitude des tarifs du catalogue, la répartition BIC/BNC par activité, l'hypothèse des 60 %.

## Article par article

### 1. `premiers-pas-revenu-complementaire` (revenu complémentaire)
- Sources : Régime micro-social (21 février 2026).
- Chiffres affichés : 21,2 % · 25,6 % · 37 500 € · 83 600 €.
- À vérifier : les quatre étapes de démarrage (définir l'offre, annonce, devis, facturer) et la mention « TVA non applicable, art. 293 B du CGI » tant que la franchise s'applique ; les liens vers les guides existants.
- Aucun montant de revenu n'est promis.

### 2. `calculer-net-micro-entrepreneur` (revenu complémentaire)
- Sources : Régime micro-social (21 février 2026).
- Chiffres affichés : 21,2 % · 25,6 % · 12,3 % · 37 500 € · 83 600 € · 0,788 € par euro encaissé · exemples 300 € (236,40 € BIC, 223,20 € BNC, 3 600 € par an), 600 € (472,80 € BIC, 446,40 € BNC, 7 200 € par an), 1 000 € (788,00 € BIC, 744,00 € BNC, 12 000 € par an).
- À vérifier : la formule net = chiffre d'affaires × (1 − taux) ; l'affirmation « pas de calcul sur les charges réelles » ; la phrase sur le dépôt-vente ; la liste des activités BIC et BNC (voir ci-dessus).
- Recalcul : chaque montant est produit par `simulate()` ; un test recalcule l'exemple de l'objectif de budget.

### 3. `quel-tarif-fixer-activite-services` (revenu complémentaire)
- Sources : Régime micro-social (21 février 2026).
- Chiffres affichés : tableau de 8 activités à l'heure (tarifs du catalogue, net par heure facturée, net par heure de disponibilité à 60 %), p. ex. bricolage 20 à 35 €/h → 15,8 à 27,6 € net → 9,5 à 16,5 € par heure de disponibilité ; promenade et garde d'animaux 12 à 20 €/visite → 9,5 à 15,8 € net.
- À vérifier : que les tarifs du catalogue vous paraissent défendables comme « repères indicatifs » ; l'hypothèse des 60 % ; le renvoi vers le guide du premier devis.
- Le dépôt-vente n'est pas chiffré.

### 4. `objectif-revenu-complementaire-budget` (budget)
- Sources : Régime micro-social (21 février 2026).
- Chiffres affichés : objectif fictif 300 € net → 381 € à encaisser (21,2 %), contrôle du simulateur 300,23 € ; bricolage 20 à 35 €/h → 11 à 20 heures facturées par mois → 5 à 9 heures de disponibilité par semaine (60 %).
- À vérifier : la méthode en trois étapes (écart de budget → chiffre d'affaires → heures) et l'encart « un euro économisé ne supporte pas de cotisations, un euro encaissé en micro-entreprise en supporte ».

### 5. `dlc-ddm-jeter-moins-produits-alimentaires` (économies)
- Source : fiche service-public.gouv.fr « Date limite de consommation (DLC), de durabilité minimale (DDM), de congélation » (<https://www.service-public.gouv.fr/particuliers/vosdroits/F10990>), vérifiée le 6 février 2026, lue en entier.
- Chiffres affichés : seuils de précision de la DDM (moins de 3 mois : jour et mois ; 3 à 18 mois : mois et année ; plus de 18 mois : année).
- À vérifier : les définitions (DLC = limite de sécurité, DDM = date indicative de qualité), les mentions « À consommer jusqu'au… » et « À consommer de préférence avant… », la liste de produits sans DDM, la date de congélation.
- Les conseils pratiques de la section 4 (organiser ses courses autour des dates) sont de l'assistant, sans source, et ne chiffrent aucune économie.

### 6. `comparer-prix-au-kilo-shrinkflation` (économies)
- Sources : fiche « Affichage des prix : règles à respecter » (<https://www.service-public.gouv.fr/particuliers/vosdroits/F34344>, vérifiée le 2 juillet 2024) ; actualité « Shrinkflation » (<https://entreprendre.service-public.gouv.fr/actualites/A17378>, mise à jour le 29 juillet 2024, signalée « ancienne » par le site). Lues en entier.
- Chiffres affichés : 400 m² (supermarchés à prédominance alimentaire), deux mois à compter de la mise en vente de la quantité réduite, 1er juillet 2024 ; exemples fictifs 500 g à 2,40 € (4,80 €/kg) contre 750 g à 3,30 € (4,40 €/kg) ; 500 g → 450 g au même prix : 5,33 €/kg, soit 11,1 % de plus.
- **À revérifier avant publication** : la règle de la shrinkflation et la liste officielle des produits soumis au prix à l'unité ont pu évoluer depuis 2024.

### 7. `resilier-abonnement-en-ligne-trois-clics` (économies)
- Source : actualité « Résiliation "en 3 clics" : application et étapes » (<https://entreprendre.service-public.gouv.fr/actualites/A16599>, mise à jour le 14 septembre 2023, signalée « ancienne » par le site). Lue en entier.
- Chiffres affichés : exemple fictif de trois abonnements, 53,38 € par mois, 640,56 € par an (29,90 € + 9,99 € + 13,49 €).
- **À revérifier avant publication** : la règle (loi n° 2022-1158 du 16 août 2022, décret n° 2023-417 du 31 mai 2023) et la liste des contrats concernés. La fiche service-public sur la téléphonie et l'internet (F22486, non lue en entier) mentionne un courrier recommandé : l'article renvoie à la fiche du contrat concerné.

## Avant d'activer la newsletter et les envois

Dans l'ordre :

1. Relire les articles à publier ci-dessus et renseigner `reviewedOn`.
2. Faire relire par un juriste la section « Newsletter » de la politique de confidentialité et le texte de consentement (`src/lib/newsletter-consent.ts`) : les deux sont des brouillons.
3. Appliquer les migrations `0010_newsletter.sql` et `0011_newsletter_campaigns.sql` sur Supabase.
4. Vérifier `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, définir `NEWSLETTER_SEND_SECRET` ; `npm run check:env`.
5. Mentions légales (T01) : l'adresse de l'éditeur est vide ; l'ajouter au pied de page des newsletters si votre conseil juridique l'exige.
6. Définir `NEWSLETTER_ENABLED=true`, redéployer, s'inscrire soi-même avec un vrai e-mail, confirmer, se désinscrire.
7. Envoyer un test (`--mode test`) avant tout envoi réel : l'appel à l'endpoint d'envoi groupé de Resend n'a jamais été exécuté.

## Mise à jour de ce dossier

Les sections « Chiffres affichés » ont été extraites du rendu des articles le 16 octobre 2026 ; elles datent d'avant tout changement de `tax.ts`, de `activities.ts` ou du texte. Après une modification, régénérer la liste (rendre chaque `Content` avec `renderToStaticMarkup` dans un test temporaire) ou relire l'article.
