import { LEGAL } from "@/lib/legal";
import { absoluteUrl } from "@/lib/seo";
import { eur, TAX_PARAMS } from "@/lib/tax";
import { unsubscribeToken } from "@/lib/email";

export interface Rendered {
  subject: string;
  html: string;
  text: string;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const unsubscribeUrl = (userId: string) =>
  `${absoluteUrl("/api/email/unsubscribe")}?u=${encodeURIComponent(userId)}&t=${unsubscribeToken(userId)}`;

function layout(body: string, footer: string) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
<div style="max-width:560px;margin:0 auto;padding:24px"><div style="background:#fff;border-radius:8px;padding:24px;line-height:1.5;font-size:15px">${body}</div>
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
  const text = `Bonjour ${p.clientName},\n\nVeuillez trouver ci-joint ${p.documentLabel.toLowerCase()} ${p.number} d'un montant de ${eur(p.amount)}.\n\nCordialement,\n${p.issuerName}\n\nDocument envoyé via Compléo.`;
  const html = layout(
    `<p>Bonjour ${esc(p.clientName)},</p><p>Veuillez trouver ci-joint ${esc(p.documentLabel.toLowerCase())} <strong>${esc(p.number)}</strong> d'un montant de <strong>${esc(eur(p.amount))}</strong>.</p><p>Cordialement,<br>${esc(p.issuerName)}</p>`,
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
