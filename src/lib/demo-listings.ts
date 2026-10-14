import { ACTIVITIES, formatRate, type Activity } from "@/lib/activities";

/**
 * Exemples d'annonces pré-rédigés pour la démo publique (aucun appel IA anonyme).
 * Titre, accroche et tarif viennent du catalogue `activities.ts` ; seuls avantages et compétences sont propres à la démo.
 */
const DETAILS: Record<string, { advantages: string[]; skills: string[] }> = {
  bricolage: {
    advantages: ["Intervention rapide près de chez vous", "Matériel apporté", "Devis annoncé avant de commencer"],
    skills: ["Fixations et pose d'étagères", "Montage de luminaires simples", "Petites réparations du quotidien"],
  },
  montage_meubles: {
    advantages: ["Montage soigné, notice respectée", "Forfait à la pièce ou à l'heure", "Évacuation des cartons sur demande"],
    skills: ["Meubles en kit de toutes marques", "Fixation murale de sécurité", "Réglage des portes et tiroirs"],
  },
  soutien_scolaire: {
    advantages: ["Cours à domicile ou en visio", "Méthode adaptée à l'enfant", "Points réguliers avec les parents"],
    skills: ["Aide aux devoirs", "Remise à niveau", "Méthodes de travail et organisation"],
  },
  cours_langue: {
    advantages: ["Séances de conversation concrètes", "Rythme adapté à votre objectif", "Présentiel ou visio"],
    skills: ["Conversation courante", "Préparation d'entretiens ou d'examens", "Vocabulaire professionnel"],
  },
  coursier: {
    advantages: ["Courses déposées à votre porte", "Respect des horaires convenus", "Idéal pour les personnes peu mobiles"],
    skills: ["Courses alimentaires", "Retrait et dépôt de colis", "Livraisons locales"],
  },
  garde_animaux: {
    advantages: ["Promenades régulières", "Nouvelles et photos pendant la garde", "Respect des habitudes de l'animal"],
    skills: ["Promenade de chiens", "Passages à domicile pour les chats", "Garde pendant vos absences"],
  },
  menage: {
    advantages: ["Soin et discrétion", "Créneaux réguliers ou ponctuels", "Produits selon vos préférences"],
    skills: ["Ménage courant", "Repassage", "Remise en état avant ou après un déménagement"],
  },
  jardinage: {
    advantages: ["Jardin propre à chaque passage", "Évacuation des déchets verts sur demande", "Entretien ponctuel ou régulier"],
    skills: ["Tonte et taille de haies", "Désherbage", "Entretien des massifs"],
  },
  aide_informatique: {
    advantages: ["Explications claires, sans jargon", "Intervention à domicile ou à distance", "Aide à la prise en main"],
    skills: ["Dépannage courant", "Initiation à la messagerie et aux démarches en ligne", "Configuration d'appareils"],
  },
  depot_vente: {
    advantages: ["Photos et annonces rédigées pour vous", "Suivi des demandes d'achat", "Vous n'avez qu'à remettre l'article"],
    skills: ["Tri et photographie des articles", "Rédaction d'annonces", "Gestion des échanges avec les acheteurs"],
  },
};

export interface DemoListing {
  activityId: string;
  title: string;
  body: string;
}

export function demoListing(a: Activity): DemoListing {
  const d = DETAILS[a.id];
  const bullets = (xs: string[]) => xs.map((x) => `• ${x}`).join("\n");
  return {
    activityId: a.id,
    title: `${a.title} à [votre ville]`,
    body: [
      a.pitch,
      d ? `Mes avantages :\n${bullets(d.advantages)}` : "",
      d ? `Ce que je propose :\n${bullets(d.skills)}` : "",
      `Tarif indicatif : ${formatRate(a)} (à adapter à votre situation).`,
      "Contactez-moi pour un devis gratuit.",
    ].filter(Boolean).join("\n\n"),
  };
}

export const DEMO_LISTINGS: DemoListing[] = ACTIVITIES.map(demoListing);
