import { LEGAL } from "@/lib/legal";
import { findCategory, postPath, type BlogPost } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";
import { eur, TAX_PARAMS } from "@/lib/tax";
import { newsletterUnsubscribeToken, unsubscribeToken } from "@/lib/email";

export interface Rendered {
  subject: string;
  html: string;
  text: string;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const unsubscribeUrl = (userId: string) =>
  `${absoluteUrl("/api/email/unsubscribe")}?u=${encodeURIComponent(userId)}&t=${unsubscribeToken(userId)}`;

export const newsletterUnsubscribeUrl = (subscriberId: string) =>
  `${absoluteUrl("/api/newsletter/unsubscribe")}?s=${encodeURIComponent(subscriberId)}&t=${newsletterUnsubscribeToken(subscriberId)}`;

function layout(body: string, footer: string) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
<div style="max-width:560px;margin:0 auto;padding:24px"><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 12px"><tr><td><img src="${esc(absoluteUrl("/logo/mark.png"))}" width="32" height="32" alt="" style="display:block;border:0"></td><td style="padding-left:8px;font-size:20px;font-weight:bold;color:#2563eb">${esc(LEGAL.siteName)}</td></tr></table><div style="background:#fff;border-radius:8px;padding:24px;line-height:1.5;font-size:15px">${body}</div>
<p style="font-size:12px;color:#666;margin-top:16px">${footer}</p></div></body></html>`;
}

const button = (href: string, label: string) =>
  `<p><a href="${esc(href)}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">${esc(label)}</a></p>`;

function tipsFooter(userId: string) {
  const url = unsubscribeUrl(userId);
  return `Vous recevez cet e-mail car vous avez accepté les conseils de Compléo. <a href="${esc(url)}">Se désinscrire</a>. ${esc(LEGAL.email)}`;
}

export function invoiceEmail(p: { number: string; documentLabel: string; issuerName: string; clientName: string; amount: number }): Rendered {
  const subject = `${p.documentLabel} ${p.number} de ${p.issuerName}`;
  const doc = `${p.documentLabel === "Devis" ? "le devis" : "la facture"}`;
  const text = `Bonjour ${p.clientName},\n\nVeuillez trouver ci-joint ${doc} ${p.number} d'un montant de ${eur(p.amount)}.\n\nCordialement,\n${p.issuerName}\n\nDocument envoyé via Compléo.`;
  const html = layout(
    `<p>Bonjour ${esc(p.clientName)},</p><p>Veuillez trouver ci-joint ${esc(doc)} <strong>${esc(p.number)}</strong> d'un montant de <strong>${esc(eur(p.amount))}</strong>.</p><p>Cordialement,<br>${esc(p.issuerName)}</p>`,
    "Document envoyé via Compléo. Répondez à ce message pour contacter l'émetteur.",
  );
  return { subject, html, text };
}

export function onboardingDay1(userId: string): Rendered {
  const link = absoluteUrl("/dashboard/simulator");
  return {
    subject: "Estimez votre revenu net avec Compléo",
    text: `Bonjour,\n\nPour démarrer : le simulateur estime vos cotisations et votre net, et vous alerte quand vous approchez des seuils. Estimation indicative, ne constitue pas un conseil fiscal.\n\n${link}\n\nSe désinscrire : ${unsubscribeUrl(userId)}`,
    html: layout(
      `<p>Bonjour,</p><p>Pour démarrer : le simulateur estime vos cotisations et votre net, et vous alerte quand vous approchez des seuils de TVA et de chiffre d'affaires.</p><p><em>Estimation indicative, ne constitue pas un conseil fiscal.</em></p>${button(link, "Ouvrir le simulateur")}`,
      tipsFooter(userId),
    ),
  };
}

export function onboardingDay3(userId: string): Rendered {
  const link = absoluteUrl("/dashboard/listings");
  return {
    subject: "Votre première annonce en quelques minutes",
    text: `Bonjour,\n\nVous n'avez pas encore généré d'annonce. Choisissez votre activité et votre ville : Compléo rédige un brouillon à relire avant publication (annonce générée par IA).\n\n${link}\n\nSe désinscrire : ${unsubscribeUrl(userId)}`,
    html: layout(
      `<p>Bonjour,</p><p>Vous n'avez pas encore généré d'annonce. Choisissez votre activité et votre ville : Compléo rédige un brouillon.</p><p><em>Annonce générée par IA, à relire avant publication.</em></p>${button(link, "Générer mon annonce")}`,
      tipsFooter(userId),
    ),
  };
}

export type CeilingKind = "ceiling_80" | "vat_80";

export function ceilingAlert(userId: string, kind: CeilingKind, paidTotal: number, year: number): Rendered {
  const isVat = kind === "vat_80";
  const threshold = isVat ? TAX_PARAMS.vatThreshold : TAX_PARAMS.microCeilingServices;
  const what = isVat ? "le seuil de franchise de TVA" : "le plafond du régime micro-entrepreneur";
  const link = absoluteUrl("/guides/" + (isVat ? "franchise-tva-micro-entrepreneur" : "plafonds-micro-entreprise-2026"));
  const sentence = `Vos factures marquées « Payé » en ${year} totalisent ${eur(paidTotal)}, soit plus de 80 % de ${what} pour les prestations de services (${eur(threshold)}).`;
  const caveat = "Estimation à partir des documents saisis dans Compléo, hypothèse de prestations de services. Votre situation réelle peut différer : vérifiez sur urssaf.fr et service-public.fr.";
  return {
    subject: isVat ? "Vous approchez du seuil de franchise de TVA" : "Vous approchez du plafond micro-entrepreneur",
    text: `Bonjour,\n\n${sentence}\n\n${caveat}\n\nEn savoir plus : ${link}\n\nSe désinscrire : ${unsubscribeUrl(userId)}`,
    html: layout(`<p>Bonjour,</p><p>${esc(sentence)}</p><p><em>${esc(caveat)}</em></p>${button(link, "Lire le guide")}`, tipsFooter(userId)),
  };
}

/** E-mail de confirmation (double opt-in). Sans clic sur le lien, l'adresse n'est pas inscrite et est supprimée sous 7 jours. */
export function newsletterConfirmationEmail(confirmUrl: string): Rendered {
  return {
    subject: "Confirmez votre inscription à la newsletter Compléo",
    text: `Bonjour,\n\nVous avez demandé à recevoir la newsletter de Compléo (conseils sur le revenu complémentaire et le budget). Pour confirmer, ouvrez ce lien :\n\n${confirmUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message : sans confirmation, votre adresse n'est pas inscrite et sera supprimée sous quelques jours.\n\n${LEGAL.siteName} · ${LEGAL.email}`,
    html: layout(
      `<p>Bonjour,</p><p>Vous avez demandé à recevoir la newsletter de Compléo (conseils sur le revenu complémentaire et le budget). Pour confirmer votre inscription, cliquez sur le bouton ci-dessous.</p>${button(confirmUrl, "Confirmer mon inscription")}<p style="font-size:13px;color:#666">Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : sans confirmation, votre adresse n'est pas inscrite et sera supprimée sous quelques jours.</p>`,
      `${esc(LEGAL.siteName)} · ${esc(LEGAL.email)}`,
    ),
  };
}

/**
 * Newsletter : introduction facultative puis une carte par article (titre, catégorie, résumé, lien). Chaque message porte
 * le lien de désinscription propre à l'abonné. `subscriberId` absent (aperçu, test) : pas de lien de désinscription actif.
 */
export function newsletterEmail(p: { subject: string; intro?: string; posts: BlogPost[]; subscriberId?: string }): Rendered & { unsubscribeUrl?: string } {
  const unsub = p.subscriberId ? newsletterUnsubscribeUrl(p.subscriberId) : undefined;
  const footerText = `Vous recevez cet e-mail car vous êtes inscrit à la newsletter de ${LEGAL.siteName}, éditée par ${LEGAL.publisherName}.`;
  const unsubText = unsub ? `Se désinscrire : ${unsub}` : "(Aperçu : le lien de désinscription est actif dans les envois réels.)";
  const items = p.posts.map((post) => ({
    title: post.title,
    category: findCategory(post.category)?.name ?? "",
    description: post.description,
    url: absoluteUrl(postPath(post)),
  }));
  const text = [
    p.intro ?? "",
    ...items.map((i) => `${i.title}\n${i.description}\n${i.url}`),
    `${footerText}\n${unsubText}\n${LEGAL.email}`,
  ].filter(Boolean).join("\n\n");
  const cards = items
    .map(
      (i) =>
        `<div style="border-top:1px solid #e5e7eb;padding:16px 0"><p style="margin:0;font-size:12px;color:#666;text-transform:uppercase">${esc(i.category)}</p><p style="margin:4px 0"><a href="${esc(i.url)}" style="font-size:17px;font-weight:bold;color:#1d4ed8;text-decoration:none">${esc(i.title)}</a></p><p style="margin:0;color:#444">${esc(i.description)}</p></div>`,
    )
    .join("");
  const intro = p.intro ? `<p>${esc(p.intro).replace(/\n/g, "<br>")}</p>` : "";
  const footer = `${esc(footerText)} ${unsub ? `<a href="${esc(unsub)}">Se désinscrire</a>` : "(Aperçu : lien de désinscription actif dans les envois réels.)"} · ${esc(LEGAL.email)}`;
  return { subject: p.subject, text, html: layout(`${intro}${cards}`, footer), unsubscribeUrl: unsub };
}
