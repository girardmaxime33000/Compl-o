"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { submitTestimonial, withdrawTestimonial } from "@/app/actions/testimonials";
import { TESTIMONIAL_BODY_MAX, TESTIMONIAL_BODY_MIN } from "@/lib/testimonial";
import type { TestimonialStatus } from "@/types/database";

const STATUS_TEXT: Record<TestimonialStatus, string> = {
  pending: "Reçu. Il sera publié après relecture, uniquement si vous l'avez autorisé.",
  approved: "Publié sur la page d'accueil.",
  rejected: "Non publié. Vous pouvez le retirer et en écrire un autre.",
};

/** Demande d'avis après une première annonce. Aucune contrepartie n'est proposée en échange. */
export function TestimonialForm({ initial }: { initial: { body: string; status: TestimonialStatus } | null }) {
  const [saved, setSaved] = useState(initial);
  const [firstName, setFirstName] = useState("");
  const [city, setCity] = useState("");
  const [body, setBody] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitTestimonial({ firstName, city, body, consent: consent as true });
      if (!res.ok) return toast(res.error ?? "Envoi impossible.", "error");
      setSaved({ body: body.trim(), status: "pending" });
      toast("Merci pour votre avis.");
    });
  }

  function withdraw() {
    startTransition(async () => {
      const res = await withdrawTestimonial();
      if (!res.ok) return toast(res.error ?? "Suppression impossible.", "error");
      setSaved(null);
      setBody("");
      setConsent(false);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre avis sur Compléo</CardTitle>
        <CardDescription>
          Dites en quelques phrases ce que Compléo vous a apporté. Facultatif, sans contrepartie. Il n'est publié qu'avec votre accord.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {saved ? (
          <div className="space-y-3">
            <p className="whitespace-pre-line rounded-md bg-muted/50 p-3 text-sm">« {saved.body} »</p>
            <p className="text-sm">{STATUS_TEXT[saved.status]}</p>
            <Button type="button" variant="outline" onClick={withdraw} disabled={pending}>Retirer mon témoignage</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="t-first">Votre prénom</Label>
                <Input id="t-first" required maxLength={40} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-city">Votre ville (facultatif)</Label>
                <Input id="t-city" maxLength={80} value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-body">Votre avis</Label>
              <Textarea id="t-body" required minLength={TESTIMONIAL_BODY_MIN} maxLength={TESTIMONIAL_BODY_MAX} rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
              <p className="text-xs text-muted-foreground">{body.trim().length} / {TESTIMONIAL_BODY_MAX} caractères (au moins {TESTIMONIAL_BODY_MIN}).</p>
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
              <span>
                J'autorise la publication de ce texte, de mon prénom et de ma ville sur le site Compléo. Je peux le retirer à tout moment depuis cette page.
              </span>
            </label>
            <Button type="submit" size="lg" disabled={pending || !consent}>Envoyer mon avis</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
