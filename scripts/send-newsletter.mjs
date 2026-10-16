#!/usr/bin/env node
/**
 * Envoi d'une newsletter via la route protégée /api/newsletter/send.
 *
 *   NEWSLETTER_SEND_SECRET=… node scripts/send-newsletter.mjs --campaign 2026-11-a --subject "Objet" \
 *     --posts slug-un,slug-deux [--intro "Texte"] --mode preview|test|send [--to moi@exemple.fr] [--url https://compleo.work]
 *
 * Ordre conseillé : preview (compteurs et rendu), test (un message à votre adresse), send (envoi réel, par lots, repris
 * automatiquement jusqu'à épuisement). Le secret ne se passe jamais en argument : variable d'environnement uniquement.
 * Un envoi interrompu se reprend en relançant la même commande : personne ne reçoit deux fois la même campagne.
 * Seuls les articles relus (reviewedOn) sont acceptés ; le contenu d'une campagne est figé dès le premier lot.
 */
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

const secret = process.env.NEWSLETTER_SEND_SECRET;
const mode = opt("--mode") ?? "preview";
const base = (opt("--url") ?? process.env.NEWSLETTER_BASE_URL ?? "https://compleo.work").replace(/\/$/, "");
const body = {
  campaignId: opt("--campaign"),
  subject: opt("--subject"),
  intro: opt("--intro"),
  posts: (opt("--posts") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  mode,
  to: opt("--to"),
};

if (!secret) { console.error("NEWSLETTER_SEND_SECRET manquant (variable d'environnement)."); process.exit(2); }
if (!body.campaignId || !body.subject || body.posts.length === 0 || !["preview", "test", "send"].includes(mode)) {
  console.error("Usage : voir l'en-tête du script (--campaign, --subject, --posts, --mode preview|test|send).");
  process.exit(2);
}

async function call() {
  const res = await fetch(`${base}/api/newsletter/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

if (mode === "send") console.log(`Envoi réel de la campagne « ${body.campaignId} » vers ${base}. Ctrl+C pour interrompre (reprise possible).`);
let total = 0;
for (;;) {
  const { res, data } = await call();
  if (!res.ok) { console.error(`Erreur ${res.status} :`, data.error ?? data, data.details ?? ""); process.exit(1); }
  if (mode !== "send") {
    const summary = { ...data };
    const text = summary.text;
    delete summary.html; // le HTML n'est pas affiché dans le terminal
    delete summary.text;
    console.log(JSON.stringify(summary, null, 2));
    if (text) console.log(`\n--- Aperçu texte ---\n${text}`);
    break;
  }
  total += data.sent ?? 0;
  console.log(`Lot envoyé : ${data.sent}, restants : ${data.remaining}${data.note ? ` (${data.note})` : ""}`);
  if (data.done || (data.sent === 0 && data.remaining === 0)) break;
  if (data.sent === 0) { console.error("Aucun envoi : un autre appel est peut-être en cours. Relancez dans une minute."); process.exit(1); }
  await new Promise((r) => setTimeout(r, 1200)); // limite de débit de l'API d'envoi
}
if (mode === "send") console.log(`Terminé : ${total} message(s) envoyé(s) dans cette exécution.`);
