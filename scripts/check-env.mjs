#!/usr/bin/env node
/**
 * Contrôle des variables d'environnement d'un déploiement, sans rien afficher de secret.
 *
 *   node scripts/check-env.mjs --env production|preview|development [--file chemin/.env]
 *
 * Lit process.env (et le fichier donné par --file, au format .env). Sort avec le code 1 si une variable requise manque
 * ou si un réglage dangereux est détecté (clé Stripe live hors production, adresse localhost en ligne).
 * Pour un déploiement Vercel : `vercel env pull .env.check --environment=preview` puis `--file .env.check`.
 */
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const target = opt("--env") ?? "production";
if (!["production", "preview", "development"].includes(target)) {
  console.error("Usage : node scripts/check-env.mjs --env production|preview|development [--file .env]");
  process.exit(2);
}

const env = { ...process.env };
const file = opt("--file");
if (file) {
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const has = (k) => Boolean(env[k] && env[k].trim());
const errors = [];
const warnings = [];
const need = (keys, why) => keys.filter((k) => !has(k)).forEach((k) => errors.push(`${k} manquante (${why})`));

need(["NEXT_PUBLIC_SITE_URL"], "retours Stripe, liens d'e-mail, URL canoniques");
need(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"], "authentification et base");
need(["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_PACK_PRICE_ID", "STRIPE_MONTHLY_PRICE_ID", "STRIPE_ANNUAL_PRICE_ID"], "paiement");
need(["CRON_SECRET"], "cron des e-mails et liens de désinscription");

const provider = env.AI_PROVIDER || "openai-compatible";
if (provider === "openai-compatible") need(["AI_BASE_URL", "AI_MODEL"], "fournisseur d'IA openai-compatible");
else if (provider === "openai") need(["OPENAI_API_KEY"], "AI_PROVIDER=openai");
else if (provider === "anthropic") need(["ANTHROPIC_API_KEY"], "AI_PROVIDER=anthropic");
else errors.push(`AI_PROVIDER inconnu : ${provider}`);
if (provider === "openai-compatible" && /localhost|127\.0\.0\.1/.test(env.AI_BASE_URL ?? "")) {
  errors.push("AI_BASE_URL pointe vers localhost : injoignable depuis Vercel");
}

if (has("RESEND_API_KEY") !== has("EMAIL_FROM")) warnings.push("RESEND_API_KEY et EMAIL_FROM vont ensemble : l'envoi d'e-mails reste désactivé tant que les deux ne sont pas définies");
if (!has("RESEND_API_KEY")) warnings.push("E-mail non configuré : envoi de factures et séquence d'e-mails désactivés");
if (env.CRON_SECRET && env.CRON_SECRET.length < 32) warnings.push("CRON_SECRET court (moins de 32 caractères)");

// Garde-fous : mélange des environnements.
const stripeKey = env.STRIPE_SECRET_KEY ?? "";
if (target !== "production" && stripeKey.startsWith("sk_live")) errors.push(`clé Stripe LIVE dans l'environnement ${target}`);
if (target === "production" && stripeKey.startsWith("sk_test")) warnings.push("clé Stripe de TEST en production");
if (target !== "development" && /localhost|127\.0\.0\.1/.test(env.NEXT_PUBLIC_SITE_URL ?? "")) errors.push(`NEXT_PUBLIC_SITE_URL pointe vers localhost dans l'environnement ${target}`);
if (env.NEXT_PUBLIC_SITE_URL?.endsWith("/")) warnings.push("NEXT_PUBLIC_SITE_URL ne doit pas finir par « / »");
if (env.NEXT_PUBLIC_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_STRIPE_SECRET_KEY) errors.push("un secret porte le préfixe NEXT_PUBLIC_ : il serait visible par le navigateur");

console.log(`Contrôle de l'environnement « ${target} » (${Object.keys(env).length} variables lues)`);
for (const w of warnings) console.log(`  attention : ${w}`);
for (const e of errors) console.log(`  ERREUR    : ${e}`);
if (!errors.length) console.log(warnings.length ? "  Aucune erreur, des avertissements." : "  Tout est en ordre.");
process.exit(errors.length ? 1 : 0);
