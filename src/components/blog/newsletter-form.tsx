"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/newsletter-consent";

type State = { status: "idle" | "loading" } | { status: "done" | "error"; message: string };

/** Inscription à la newsletter (double opt-in). Case de consentement non cochée par défaut, validée aussi côté serveur. */
export function NewsletterForm({ source }: { source: string }) {
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          consent: form.get("consent") === "on",
          source,
          website: String(form.get("website") ?? ""),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      setState(res.ok ? { status: "done", message: data.message ?? "Un e-mail de confirmation vient d'être envoyé." } : { status: "error", message: data.error ?? "Inscription impossible pour le moment." });
    } catch {
      setState({ status: "error", message: "Inscription impossible pour le moment." });
    }
  }

  if (state.status === "done") {
    return (
      <p role="status" className="rounded-lg border border-primary/40 bg-accent/40 p-5 text-sm">
        {state.message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border p-5" aria-labelledby="newsletter-title">
      <h2 id="newsletter-title" className="text-lg font-semibold">Recevoir les prochains articles</h2>
      <p className="text-sm text-muted-foreground">Revenu complémentaire, budget et économies : un e-mail de temps en temps, désinscription en un clic.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">Adresse e-mail</label>
        <Input id="newsletter-email" name="email" type="email" required autoComplete="email" placeholder="vous@exemple.fr" maxLength={254} className="sm:max-w-xs" />
        {/* Champ piège pour les robots : hors écran, ignoré par les lecteurs d'écran et la navigation clavier. */}
        <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <Button type="submit" disabled={state.status === "loading"}>
          {state.status === "loading" ? "Envoi…" : "Je m'inscris"}
        </Button>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4" />
        <span>
          {NEWSLETTER_CONSENT_TEXT}{" "}
          <Link href="/confidentialite" className="text-primary underline">Politique de confidentialité</Link>
        </span>
      </label>
      {state.status === "error" && <p role="alert" className="text-sm text-destructive">{state.message}</p>}
    </form>
  );
}
