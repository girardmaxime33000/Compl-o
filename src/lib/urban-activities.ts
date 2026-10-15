/**
 * Catalogue des activités urbaines (segment URBAN). Étend le catalogue `activities.ts` sans le modifier : les fiches
 * existantes n'ont aucun champ nouveau. Le catalogue est du code (aucune table d'activités en base) : ajouter ou
 * modifier une fiche = modifier ce fichier. Les règles de calcul sont dans `urban-income.ts`, les paramètres
 * fiscaux dans `tax.ts` (`FISCAL_PARAMS_BY_YEAR`). Les tarifs et revenus sont des repères indicatifs fournis par le
 * propriétaire (15 octobre 2026), non issus d'une étude de marché sourcée.
 */
export type TaxCategory = "BIC_SERVICES" | "BIC_SALES" | "BNC_SSI";
export type CfpCategory = "COMMERCE" | "ARTISANAT" | "LIBERAL";
export type EntryBarrier = "LOW" | "MEDIUM" | "HIGH";
export type SapEligibility = "NONE" | "IT_ASSISTANCE" | "SMALL_DIY" | "SMALL_GARDENING";
export type ActivityStatus = "PUBLISHED" | "EMERGING";
export type Profile = "OCCASIONAL" | "REGULAR";

export interface PriceLine {
  label: string;
  minEur: number;
  maxEur: number;
  unit: "HOUR" | "SERVICE" | "MONTH" | "ITEM" | "PERCENT";
  note?: string;
}
export interface EquipmentLine {
  label: string;
  minEur: number;
  maxEur: number;
  recurring?: "YEARLY";
  note?: string;
}
export interface AcquisitionChannel { channel: string; usage: string }
export interface RiskItem { label: string; mitigation: string }

export interface RevenueOverride { revenue: number; composition: string }

/** Valeur par défaut d'une variable de modèle d'annonce, lue dans la grille tarifaire de la fiche. */
export interface AdVariableDefault { priceLabel: string; field: "minEur" | "maxEur" }

/**
 * Fiche d'activité urbaine. Les champs absents des fiches EMERGING sont optionnels : elles seront complétées après
 * validation produit.
 */
export interface UrbanActivity {
  slug: string;
  name: string;
  status: ActivityStatus;
  segment: "URBAN";
  pitch: string;
  painPoints?: string[];
  pricing: PriceLine[];
  effectiveHourlyRate?: Record<Profile, number>;
  /** Remplace le calcul horaire (CA composite). */
  revenueOverride?: Record<Profile, RevenueOverride>;
  monthlyOperatingCosts?: Record<Profile, number>;
  taxCategory: TaxCategory;
  taxCategoryToConfirm: boolean;
  cfpCategory: CfpCategory;
  sapEligibility: SapEligibility;
  equipment?: EquipmentLine[];
  entryBarrier?: EntryBarrier;
  skills?: string[];
  certifications?: string[];
  regulatoryNotes: string[];
  risks?: RiskItem[];
  acquisitionChannels?: AcquisitionChannel[];
  adTemplate?: string;
  adTemplateVariables?: string[];
  /** Valeur proposée par défaut pour les variables tarifaires du modèle (hors `quartier`, saisi par le candidat). */
  adVariableDefaults?: Record<string, AdVariableDefault>;
  capacityNote: string;
}

export const URBAN_ACTIVITIES: UrbanActivity[] = [
  {
    slug: "reparation-velo-trottinette-domicile",
    name: "Réparation et entretien de vélos et trottinettes à domicile",
    status: "PUBLISHED",
    segment: "URBAN",
    pitch: "Remettre en état les vélos et trottinettes des habitants de votre quartier au pied de leur immeuble ou sur leur lieu de travail, avec un outillage transportable à vélo.",
    painPoints: [
      "Un vélo crevé ou un VAE de 25 kg se transporte mal sans voiture.",
      "Les ateliers de centre-ville affichent des délais de plusieurs jours en période de pointe.",
      "Les logements urbains n'offrent ni espace ni outillage pour réparer soi-même.",
      "Une intervention de 30 à 60 minutes sur place évite plusieurs jours d'immobilisation.",
    ],
    pricing: [
      { label: "Déplacement", minEur: 0, maxEur: 20, unit: "SERVICE", note: "Inclus dans un rayon de 3 km" },
      { label: "Réparation crevaison", minEur: 25, maxEur: 35, unit: "SERVICE", note: "Pièce en sus" },
      { label: "Réglage freins et vitesses", minEur: 35, maxEur: 50, unit: "SERVICE" },
      { label: "Révision complète vélo musculaire", minEur: 70, maxEur: 100, unit: "SERVICE" },
      { label: "Révision complète VAE (partie mécanique)", minEur: 90, maxEur: 130, unit: "SERVICE" },
      { label: "Trottinette : crevaison ou plaquettes", minEur: 25, maxEur: 45, unit: "SERVICE", note: "Pièce en sus" },
    ],
    effectiveHourlyRate: { OCCASIONAL: 40, REGULAR: 42 },
    monthlyOperatingCosts: { OCCASIONAL: 40, REGULAR: 90 },
    taxCategory: "BIC_SERVICES",
    taxCategoryToConfirm: false,
    cfpCategory: "ARTISANAT",
    sapEligibility: "NONE",
    equipment: [
      { label: "Pied d'atelier pliable", minEur: 80, maxEur: 150 },
      { label: "Coffret outillage cycle", minEur: 200, maxEur: 400 },
      { label: "Clé dynamométrique 4-20 Nm", minEur: 60, maxEur: 120 },
      { label: "Pompe à manomètre et kit tubeless", minEur: 50, maxEur: 90 },
      { label: "Stock de consommables", minEur: 150, maxEur: 300 },
      { label: "Remorque ou sacoches de transport", minEur: 150, maxEur: 400 },
      { label: "RC Pro et garantie biens confiés", minEur: 300, maxEur: 300, recurring: "YEARLY" },
    ],
    entryBarrier: "MEDIUM",
    skills: ["Transmission", "Freinage mécanique et hydraulique (purge)", "Dévoilage de roues", "Réglage de direction"],
    certifications: ["CQP Technicien cycles (recommandé)"],
    regulatoryNotes: [
      "Activité artisanale : immatriculation au RNE, interlocuteur CMA.",
      "Exigence de qualification à vérifier auprès de la CMA (règle R4).",
      "Diagnostic électronique VAE hors périmètre (outils constructeurs réservés aux revendeurs agréés).",
    ],
    risks: [
      { label: "Accident lié à un défaut de serrage ou de freinage", mitigation: "RC Pro, fiche de contrôle signée, photos avant/après" },
      { label: "Vol ou casse d'un vélo pris en charge", mitigation: "Garantie biens confiés" },
      { label: "Incendie batterie lithium", mitigation: "Aucune ouverture de batterie ni intervention sur contrôleur" },
      { label: "Intervention sur voie publique", mitigation: "Cour, parking ou local vélo avec accord du syndic" },
    ],
    acquisitionChannels: [
      { channel: "AlloVoisins, Leboncoin services", usage: "Demandes ponctuelles, premiers avis" },
      { channel: "Groupes WhatsApp/Facebook de quartier et d'immeuble", usage: "Notoriété locale" },
      { channel: "Syndics et conseils syndicaux", usage: "Journée révision dans le local vélo (10 à 20 vélos par demi-journée)" },
      { channel: "Entreprises avec flotte ou salariés cyclistes", usage: "Journée atelier sur site, contrats récurrents" },
      { channel: "Commerçants du quartier", usage: "Flyers avec QR code" },
      { channel: "Ateliers vélo associatifs", usage: "Renvoi des demandes hors autoréparation" },
    ],
    adTemplate: "Mécanicien vélo dans le quartier [quartier], j'interviens chez vous ou à votre bureau. Crevaison réparée en 30 minutes, révision complète dès [prix_min] €, sans immobiliser votre vélo en atelier. Déplacement inclus dans un rayon de 3 km, pièces en sus. Devis gratuit par message.",
    adTemplateVariables: ["quartier", "prix_min"],
    adVariableDefaults: { prix_min: { priceLabel: "Révision complète vélo musculaire", field: "minEur" } },
    capacityNote: "Saisonnalité marquée de novembre à février ; contrats B2B pour lisser l'activité. Vélo-cargo rentable au-delà de 40 h facturées par mois.",
  },
  {
    slug: "home-organising-petits-logements",
    name: "Home organising et désencombrement de petits logements",
    status: "PUBLISHED",
    segment: "URBAN",
    pitch: "Aider les habitants de studios et de T2 à trier, libérer et organiser leur logement en séances de 3 heures, avec une méthode qu'ils pourront tenir seuls ensuite.",
    painPoints: [
      "Chaque mètre carré coûte cher ; un espace encombré est une surface payée et inutilisable.",
      "Un tiers neutre accélère les décisions de tri, psychologiquement coûteuses.",
      "Demande concentrée sur les moments de bascule : emménagement, naissance, télétravail, mise en vente.",
      "Absence de véhicule et de temps pour évacuer dons et encombrants.",
    ],
    pricing: [
      { label: "Taux horaire", minEur: 40, maxEur: 70, unit: "HOUR" },
      { label: "Visite diagnostic (1 h)", minEur: 50, maxEur: 80, unit: "SERVICE", note: "Déductible de la mission" },
      { label: "Forfait studio cuisine + dressing (3 h)", minEur: 150, maxEur: 200, unit: "SERVICE" },
      { label: "Forfait T2 complet (2 séances, 6 à 8 h)", minEur: 300, maxEur: 450, unit: "SERVICE" },
      { label: "Préparation de déménagement", minEur: 45, maxEur: 60, unit: "HOUR" },
      { label: "Suivi trimestriel (1 h 30)", minEur: 60, maxEur: 90, unit: "SERVICE" },
    ],
    effectiveHourlyRate: { OCCASIONAL: 50, REGULAR: 50 },
    monthlyOperatingCosts: { OCCASIONAL: 40, REGULAR: 110 },
    taxCategory: "BNC_SSI",
    taxCategoryToConfirm: true,
    cfpCategory: "LIBERAL",
    sapEligibility: "NONE",
    equipment: [
      { label: "Étiqueteuse", minEur: 30, maxEur: 60 },
      { label: "Mètre, télémètre laser, gants, sacs de tri", minEur: 50, maxEur: 80 },
      { label: "Contenants de démonstration", minEur: 50, maxEur: 100 },
      { label: "Formation home organiser (optionnelle)", minEur: 0, maxEur: 2500 },
      { label: "RC Pro", minEur: 150, maxEur: 250, recurring: "YEARLY" },
    ],
    entryBarrier: "LOW",
    skills: ["Tri par catégorie", "Zonage selon les usages", "Optimisation verticale", "Entretien sans jugement", "Connaissance des filières de don et recyclage"],
    certifications: [],
    regulatoryNotes: [
      "Classification BNC ou BIC à confirmer à l'immatriculation.",
      "Revente de contenants = achat-revente (BIC ventes 12,3 %), à déclarer séparément.",
      "Non éligible en principe au crédit d'impôt SAP.",
      "Accumulation sévère d'objets : orientation vers un professionnel de santé.",
    ],
    risks: [
      { label: "Objet jeté par erreur", mitigation: "Décharge de tri signée, photos des objets de valeur" },
      { label: "Casse lors des manipulations", mitigation: "RC Pro" },
      { label: "Transport de déchets pour autrui", mitigation: "Déclaration préfectorale au-delà de 0,5 t par chargement ; se limiter au dépôt ponctuel" },
      { label: "Revente pour le compte du client", mitigation: "Mandat écrit, commissions déclarées en BIC" },
    ],
    acquisitionChannels: [
      { channel: "Instagram, TikTok (avant/après)", usage: "Preuve de résultat" },
      { channel: "Agents immobiliers, home stagers", usage: "Préparation avant vente ou location" },
      { channel: "Entreprises de déménagement", usage: "Tri en amont" },
      { channel: "Groupes de parents", usage: "Réaménagement des petits logements" },
      { channel: "Leboncoin, AlloVoisins", usage: "Demandes ponctuelles" },
      { channel: "Groupes de quartier", usage: "Recommandation" },
    ],
    adTemplate: "Studio saturé ou T2 qui déborde ? Je vous aide à trier, libérer et organiser votre espace en une séance de 3 heures. Méthode simple à tenir, sans jugement, et vos objets donnés ou déposés en ressourcerie. Visite diagnostic d'une heure, déduite de la mission. Forfait studio à partir de [prix_min] €.",
    adTemplateVariables: ["prix_min"],
    adVariableDefaults: { prix_min: { priceLabel: "Forfait studio cuisine + dressing (3 h)", field: "minEur" } },
    capacityNote: "Faible taux de réachat (mission T2 en 2 séances) ; suivi trimestriel et prescripteurs pour maintenir le flux. Séances limitées à 3-4 h par jour.",
  },
  {
    slug: "conciergerie-quartier",
    name: "Relais colis entre voisins et conciergerie de quartier",
    status: "PUBLISHED",
    segment: "URBAN",
    pitch: "Devenir le point de confiance de votre immeuble ou de votre rue pour la réception des colis, le dépôt des retours, la remise de clés et les petites courses.",
    painPoints: [
      "Actifs absents aux heures de livraison ; points relais saturés ou éloignés.",
      "Immeubles sans gardien : personne pour réceptionner, accueillir un artisan ou remettre des clés.",
      "Retours e-commerce et ventes de seconde main imposant des dépôts fréquents.",
      "Hôtes de meublés de courte durée cherchant une remise de clés fiable.",
    ],
    pricing: [
      { label: "Réception d'un colis", minEur: 1.5, maxEur: 3, unit: "ITEM" },
      { label: "Abonnement réception colis", minEur: 10, maxEur: 15, unit: "MONTH" },
      { label: "Dépôt d'un retour ou envoi", minEur: 2, maxEur: 4, unit: "ITEM" },
      { label: "Remise de clés, accueil visiteur ou voyageur", minEur: 15, maxEur: 30, unit: "SERVICE" },
      { label: "Attente artisan ou livraison", minEur: 15, maxEur: 20, unit: "HOUR" },
      { label: "Courses, pressing, cordonnerie", minEur: 15, maxEur: 20, unit: "HOUR" },
    ],
    effectiveHourlyRate: { OCCASIONAL: 0, REGULAR: 0 },
    revenueOverride: {
      OCCASIONAL: { revenue: 424, composition: "10 abonnements × 12 € + 20 colis × 2 € + 6 remises de clés × 20 € + 8 h × 18 €" },
      REGULAR: { revenue: 1630, composition: "30 abonnements × 12 € + 60 colis × 2 € + 25 remises de clés × 22 € + 30 h × 20 €" },
    },
    monthlyOperatingCosts: { OCCASIONAL: 15, REGULAR: 40 },
    taxCategory: "BIC_SERVICES",
    taxCategoryToConfirm: false,
    cfpCategory: "COMMERCE",
    sapEligibility: "NONE",
    equipment: [
      { label: "Étagères et bacs étiquetés", minEur: 50, maxEur: 150 },
      { label: "Boîte à clés sécurisée ou coffre", minEur: 40, maxEur: 100 },
      { label: "Registre de dépôts (tableur ou application)", minEur: 0, maxEur: 10, note: "par mois" },
      { label: "Flyers et affiches de hall", minEur: 50, maxEur: 100 },
      { label: "RC Pro et garantie biens confiés", minEur: 150, maxEur: 300, recurring: "YEARLY" },
    ],
    entryBarrier: "LOW",
    skills: ["Fiabilité et disponibilité sur plages annoncées", "Traçabilité (horodatage, photo)", "Discrétion"],
    certifications: [],
    regulatoryNotes: [
      "Contrat de dépôt (articles 1915 et suivants du Code civil) : responsabilité du dépositaire.",
      "Vérifier règlement de copropriété (clause d'habitation bourgeoise) et informer le bailleur.",
      "Réseaux de points relais généralement réservés aux commerces avec local.",
      "Meublés de tourisme : remise de clés autorisée ; gestion locative soumise à la loi Hoguet.",
      "Registre de données personnelles minimal et purgé régulièrement (RGPD).",
    ],
    risks: [
      { label: "Perte ou vol d'un colis", mitigation: "CGV avec plafond de valeur par colis, garantie biens confiés" },
      { label: "Litige sur la remise", mitigation: "Registre horodaté avec photo à la réception et à la remise" },
      { label: "Conflit de copropriété", mitigation: "Accord du syndic pour l'affichage, vérification du règlement" },
    ],
    acquisitionChannels: [
      { channel: "Groupe WhatsApp/Facebook de l'immeuble", usage: "Canal principal" },
      { channel: "Affichage hall (accord syndic)", usage: "Couverture de l'immeuble" },
      { channel: "Conseil syndical", usage: "Reconnaissance, accès éventuel à un local" },
      { channel: "Hôtes de meublés du quartier", usage: "Remises de clés récurrentes" },
      { channel: "Immeubles voisins, commerçants", usage: "Extension à 300 m" },
      { channel: "AlloVoisins", usage: "Missions ponctuelles" },
    ],
    adTemplate: "Absent en journée ? Je réceptionne vos colis dans l'immeuble, dépose vos retours e-commerce et remets vos clés à vos visiteurs ou artisans, avec registre horodaté et photo à chaque remise. Abonnement à partir de [prix_min] € par mois, disponible du lundi au samedi sur plages annoncées.",
    adTemplateVariables: ["prix_min"],
    adVariableDefaults: { prix_min: { priceLabel: "Abonnement réception colis", field: "minEur" } },
    capacityNote: "Stockage limitant au-delà de 30 abonnés ; la valeur se déplace vers les prestations à l'acte.",
  },
  {
    slug: "configuration-objets-connectes",
    name: "Configuration d'objets connectés et de box internet à domicile",
    status: "PUBLISHED",
    segment: "URBAN",
    pitch: "Installer et configurer box, réseau Wi-Fi, caméras, thermostats et éclairage connectés chez les particuliers, puis leur apprendre à s'en servir.",
    painPoints: [
      "Murs porteurs, interférences et box mal placées dégradent le Wi-Fi malgré la fibre.",
      "Multiplication des écosystèmes (Matter, Thread, Zigbee, applications propriétaires).",
      "Support opérateur et enseigne limité à la ligne ou au produit isolé.",
      "Seniors et nouveaux emménagés ayant besoin d'une prise en main sur place.",
    ],
    pricing: [
      { label: "Taux horaire", minEur: 45, maxEur: 60, unit: "HOUR" },
      { label: "Diagnostic et optimisation Wi-Fi", minEur: 50, maxEur: 80, unit: "SERVICE" },
      { label: "Installation box et répéteurs ou système maillé", minEur: 60, maxEur: 100, unit: "SERVICE" },
      { label: "Caméra, visiophone ou sonnette connectée", minEur: 60, maxEur: 120, unit: "ITEM" },
      { label: "Écosystème domotique", minEur: 150, maxEur: 400, unit: "SERVICE" },
      { label: "Assistance à distance", minEur: 10, maxEur: 15, unit: "MONTH" },
    ],
    effectiveHourlyRate: { OCCASIONAL: 50, REGULAR: 50 },
    monthlyOperatingCosts: { OCCASIONAL: 30, REGULAR: 100 },
    taxCategory: "BNC_SSI",
    taxCategoryToConfirm: true,
    cfpCategory: "LIBERAL",
    sapEligibility: "IT_ASSISTANCE",
    equipment: [
      { label: "Perceuse-visseuse sans fil", minEur: 80, maxEur: 150 },
      { label: "Détecteur de matériaux et de câbles", minEur: 25, maxEur: 40 },
      { label: "Pince à sertir RJ45 et testeur", minEur: 30, maxEur: 50 },
      { label: "Application d'analyse Wi-Fi", minEur: 0, maxEur: 10 },
      { label: "Kit de démonstration Matter/Thread", minEur: 80, maxEur: 150 },
      { label: "Consommables", minEur: 50, maxEur: 50 },
      { label: "RC Pro incluant dommages immatériels", minEur: 200, maxEur: 350, recurring: "YEARLY" },
    ],
    entryBarrier: "MEDIUM",
    skills: ["Réseau domestique (DHCP, DNS, bandes 2,4/5/6 GHz, maillage)", "Matter, Thread, Zigbee", "Apple Home, Google Home, Home Assistant", "Sécurisation des objets connectés", "Pédagogie"],
    certifications: ["Pix (gratuit)", "CompTIA A+ (optionnel)"],
    regulatoryNotes: [
      "Crédit d'impôt SAP : plafond 3 000 € par foyer et par an (assistance informatique), 500 € pour le petit bricolage (≤ 2 h).",
      "Déclaration SAP et exclusivité des activités SAP requises (règle R3).",
      "Interventions 230 V et tableau électrique : norme NF C 15-100, hors périmètre sans compétence attestée.",
      "Vidéosurveillance : ni voie publique, ni parties communes, ni voisins ; information des salariés à domicile (CNIL).",
    ],
    risks: [
      { label: "Dommage électrique", mitigation: "Limiter aux équipements sur prise ou sur pile" },
      { label: "Caméra non conforme", mitigation: "Information écrite du client avant installation" },
      { label: "Fuite d'identifiants", mitigation: "Comptes créés par le client, aucun mot de passe conservé, charte de confidentialité" },
      { label: "Perte de données ou coupure de service", mitigation: "RC Pro avec dommages immatériels" },
    ],
    acquisitionChannels: [
      { channel: "Associations de seniors, résidences autonomie", usage: "Public sensible au crédit d'impôt" },
      { channel: "Agences immobilières, syndics", usage: "Nouveaux emménagés" },
      { channel: "Magasins indépendants d'électronique", usage: "Renvoi des acheteurs" },
      { channel: "Leboncoin, AlloVoisins", usage: "Demandes ponctuelles" },
      { channel: "Groupes de quartier", usage: "Recommandation" },
      { channel: "Annuaires SAP", usage: "Visibilité crédit d'impôt (si déclaré SAP)" },
    ],
    adTemplate: "Wi-Fi qui coupe, box à installer, caméra ou thermostat connecté à configurer ? Je règle tout chez vous et vous montre comment l'utiliser au quotidien : diagnostic Wi-Fi, box, caméras, thermostats, sans jargon. Aucune intervention sur le tableau électrique. [prix_horaire] € de l'heure{{sap}}, soit [prix_net_sap] € après crédit d'impôt de 50 %{{/sap}}.",
    adTemplateVariables: ["prix_horaire", "prix_net_sap"],
    adVariableDefaults: { prix_horaire: { priceLabel: "Taux horaire", field: "minEur" } },
    capacityNote: "Plafond client SAP non limitant ; profil Régulier à 31 200 € de CA annuel.",
  },
  {
    slug: "vente-seconde-main-pour-tiers",
    name: "Vente de seconde main pour le compte de tiers",
    status: "EMERGING",
    segment: "URBAN",
    pitch: "Photographier, publier, négocier et expédier les articles de seconde main de vos voisins contre une commission sur la vente.",
    pricing: [
      { label: "Commission sur prix de vente", minEur: 25, maxEur: 35, unit: "PERCENT" },
      { label: "Forfait de prise en charge par lot", minEur: 10, maxEur: 20, unit: "SERVICE" },
    ],
    taxCategory: "BIC_SERVICES",
    taxCategoryToConfirm: false,
    cfpCategory: "COMMERCE",
    sapEligibility: "NONE",
    regulatoryNotes: ["Mandat de vente écrit", "Commissions déclarées en BIC", "Conditions d'utilisation des plateformes à vérifier"],
    capacityNote: "Revenu net indicatif 900 à 1 300 € à 12 h/semaine selon panier moyen et taux d'écoulement.",
  },
  {
    slug: "vegetalisation-balcon-confort-ete",
    name: "Végétalisation de balcons et confort d'été des petits logements",
    status: "EMERGING",
    segment: "URBAN",
    pitch: "Aménager balcons cultivables et protections solaires pour rendre les petits logements vivables pendant les épisodes de chaleur.",
    pricing: [
      { label: "Taux horaire", minEur: 40, maxEur: 50, unit: "HOUR" },
      { label: "Forfait balcon hors fournitures", minEur: 150, maxEur: 400, unit: "SERVICE" },
    ],
    taxCategory: "BIC_SERVICES",
    taxCategoryToConfirm: false,
    cfpCategory: "ARTISANAT",
    sapEligibility: "SMALL_GARDENING",
    regulatoryNotes: ["Partie jardinage éligible SAP (plafond 5 000 €) sous condition d'exclusivité", "Charge admissible des balcons et règlement de copropriété"],
    capacityNote: "Revenu net indicatif 1 400 à 1 800 € à 12 h/semaine ; forte saisonnalité printemps-été.",
  },
  {
    slug: "pilotage-consommation-electrique",
    name: "Accompagnement au pilotage de la consommation électrique",
    status: "EMERGING",
    segment: "URBAN",
    pitch: "Lire la courbe de charge du compteur communicant, programmer le chauffage et les équipements, et réduire la facture électrique des appartements.",
    pricing: [
      { label: "Forfait diagnostic", minEur: 60, maxEur: 90, unit: "SERVICE" },
      { label: "Suivi", minEur: 10, maxEur: 10, unit: "MONTH" },
    ],
    taxCategory: "BNC_SSI",
    taxCategoryToConfirm: false,
    cfpCategory: "LIBERAL",
    sapEligibility: "IT_ASSISTANCE",
    regulatoryNotes: ["Aucune rémunération par un fournisseur d'énergie sans statut de courtier", "Complémentaire de configuration-objets-connectes"],
    capacityNote: "Revenu net indicatif 1 300 à 1 700 € à 12 h/semaine.",
  },
];

/** Fiches visibles côté public (statut PUBLISHED uniquement). Seule source à utiliser pour les pages, sitemap et llms.txt. */
export const publishedUrbanActivities = (): UrbanActivity[] => URBAN_ACTIVITIES.filter((a) => a.status === "PUBLISHED");

/** Pistes EMERGING, réservées à la validation interne (aucune route publique ne doit les exposer). */
export const emergingUrbanActivities = (): UrbanActivity[] => URBAN_ACTIVITIES.filter((a) => a.status === "EMERGING");

/** Recherche publique : une fiche EMERGING n'est jamais retournée. */
export const findPublishedUrbanActivity = (slug: string): UrbanActivity | undefined =>
  publishedUrbanActivities().find((a) => a.slug === slug);
