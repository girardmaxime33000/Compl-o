"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { GENERATOR_PLATFORMS, PLATFORMS } from "@/lib/platforms";
import type { Listing, Platform } from "@/types/database";

function CopyButton({ listing }: { listing: Pick<Listing, "title" | "description"> }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${listing.title}\n\n${listing.description}`);
      setCopied(true);
      toast("Annonce copiée dans le presse-papiers.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Copie impossible : sélectionnez le texte manuellement.", "error");
    }
  }

  return (
    <Button onClick={copy} variant={copied ? "success" : "default"} size="sm">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copiée" : "Copier l'annonce"}
    </Button>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{PLATFORMS[listing.platform].label}</Badge>
          {listing.price_suggested != null && <Badge variant="success">≈ {listing.price_suggested} €/h</Badge>}
        </div>
        <CardTitle>{listing.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{listing.description}</p>
        <CopyButton listing={listing} />
      </CardContent>
    </Card>
  );
}

export function ListingGenerator({
  initialService,
  initialListings,
  usedThisMonth,
  limit,
}: {
  initialService: string;
  initialListings: Listing[];
  usedThisMonth: number;
  /** null = illimité (Premium) */
  limit: number | null;
}) {
  const [service, setService] = useState(initialService);
  const [city, setCity] = useState("");
  const [platform, setPlatform] = useState<Platform>("leboncoin");
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState(initialListings);
  const [used, setUsed] = useState(usedThisMonth);
  const [fresh, setFresh] = useState<Listing | null>(null);
  const { toast } = useToast();

  const limitReached = limit !== null && used >= limit;

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/generate-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, city, platform }),
      });
      const data = (await res.json()) as { listing?: Listing; error?: string; code?: string };
      if (!res.ok || !data.listing) {
        if (data.code === "LIMIT_REACHED") setUsed(limit ?? used);
        throw new Error(data.error ?? "La génération a échoué.");
      }
      setFresh(data.listing);
      setListings((prev) => [data.listing!, ...prev]);
      setUsed((n) => n + 1);
    } catch (err) {
      toast(err instanceof Error ? err.message : "La génération a échoué.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {limit !== null && (
        <Card>
          <CardContent className="space-y-2 pt-5 sm:pt-6">
            <div className="flex justify-between text-sm">
              <span>Annonces générées ce mois-ci</span>
              <span className="font-medium">{Math.min(used, limit)}/{limit}</span>
            </div>
            <Progress value={(Math.min(used, limit) / limit) * 100} indicatorClassName={limitReached ? "bg-destructive" : undefined} />
            {limitReached && (
              <p className="text-sm">
                Limite atteinte. <Link href="/pricing" className="font-medium text-primary underline">Passez Premium</Link> pour des annonces illimitées.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle annonce</CardTitle>
          <CardDescription>Renseignez le service, la ville et la plateforme.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service proposé</Label>
              <Input id="service" required minLength={3} maxLength={120} placeholder="Ex. : Petit bricolage à domicile" value={service} onChange={(e) => setService(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" required minLength={2} maxLength={80} placeholder="Ex. : Bordeaux" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Plateforme cible</Label>
                <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                  <SelectTrigger id="platform"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GENERATOR_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{PLATFORMS[p].label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading || limitReached}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Rédaction en cours…" : "Générer l'annonce"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {fresh && <ListingCard listing={fresh} />}

      {listings.filter((l) => l.id !== fresh?.id).length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Mes annonces</h2>
          {listings.filter((l) => l.id !== fresh?.id).map((l) => <ListingCard key={l.id} listing={l} />)}
        </section>
      )}
    </div>
  );
}
