"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Quota } from "@/lib/quota";
import { track } from "@/lib/analytics";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { MAX_PLATFORMS_PER_LISTING, PLATFORM_GROUPS, PLATFORMS, publishSteps } from "@/lib/platforms";
import { TONES, variantsOf, type Tone } from "@/lib/listing";
import type { Listing, ListingVariant, Platform } from "@/types/database";

function CopyButton({ variant }: { variant: Pick<ListingVariant, "title" | "description"> }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${variant.title}\n\n${variant.description}`);
      setCopied(true);
      toast("Annonce copiée. Il ne reste qu'à la coller sur le site.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Copie impossible : sélectionnez le texte à la main.", "error");
    }
  }

  return (
    <Button onClick={copy} variant={copied ? "success" : "default"} size="lg" className="w-full sm:w-auto">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copiée" : "Copier cette annonce"}
    </Button>
  );
}

/** Une annonce, une version par site : l'onglet choisi montre le texte à copier et les étapes pour la publier. */
function ListingCard({ listing }: { listing: Listing }) {
  const variants = variantsOf(listing);
  const [first] = variants;
  if (!first) return null;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">{variants.length > 1 ? `${variants.length} versions prêtes` : "Annonce prête"}</Badge>
          {listing.price_suggested != null && <Badge>≈ {listing.price_suggested} €/h</Badge>}
        </div>
        <CardDescription>Choisissez le site où vous voulez publier. Chaque version est écrite pour lui.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={first.platform}>
          <TabsList className="h-auto w-full flex-wrap justify-start">
            {variants.map((v) => (
              <TabsTrigger key={v.platform} value={v.platform} className="min-h-[40px] flex-1">
                {PLATFORMS[v.platform].label}
              </TabsTrigger>
            ))}
          </TabsList>
          {variants.map((v) => {
            const info = PLATFORMS[v.platform];
            return (
              <TabsContent key={v.platform} value={v.platform} className="space-y-4">
                <h3 className="text-lg font-semibold leading-snug">{v.title}</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{v.description}</p>
                <p className="text-xs text-muted-foreground">Annonce rédigée pour vous : relisez-la avant de la publier.</p>
                <CopyButton variant={v} />
                <div className="space-y-2 rounded-lg border bg-muted/40 p-4">
                  <p className="text-sm font-semibold">Publier sur {info.label}</p>
                  {info.note && <p className="text-sm font-medium text-amber-700">{info.note}</p>}
                  <ol className="list-decimal space-y-1 pl-5 text-sm">
                    {publishSteps(v.platform).map((step) => <li key={step}>{step}</li>)}
                  </ol>
                  {info.url && (
                    <a href={info.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary underline">
                      Ouvrir {info.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground">Compléo ne publie rien à votre place. Le site peut avoir changé : suivez ses indications.</p>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export interface ListingPrefill {
  service: string;
  skills: string;
  availability: string;
  rate?: number;
  /** Sites conseillés pour l'activité du diagnostic, cochés au départ. */
  platforms: Platform[];
}

export function ListingGenerator({
  prefill,
  initialListings,
  quota,
}: {
  prefill: ListingPrefill;
  initialListings: Listing[];
  quota: Quota;
}) {
  const { limit, period } = quota;
  const [service, setService] = useState(prefill.service);
  const [city, setCity] = useState("");
  const [skills, setSkills] = useState(prefill.skills);
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState(prefill.availability);
  const [zone, setZone] = useState("");
  const [rate, setRate] = useState(prefill.rate ? String(prefill.rate) : "");
  const [tone, setTone] = useState<Tone>("chaleureux");
  const [platforms, setPlatforms] = useState<Platform[]>(prefill.platforms);
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState(initialListings);
  const [used, setUsed] = useState(quota.used);
  const [credits, setCredits] = useState(quota.credits);
  const [fresh, setFresh] = useState<Listing | null>(null);
  const { toast } = useToast();

  const togglePlatform = (p: Platform) =>
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : prev.length < MAX_PLATFORMS_PER_LISTING ? [...prev, p] : prev));

  const limitReached = limit !== null && used >= limit;
  const blocked = limitReached && credits <= 0;
  const expiry = quota.creditsExpireAt ? ` (valables jusqu'au ${new Date(quota.creditsExpireAt).toLocaleDateString("fr-FR")})` : "";

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    const rateValue = rate.trim() ? Number(rate.replace(",", ".")) : NaN;
    setLoading(true);
    try {
      const res = await fetch("/api/generate-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          city,
          skills,
          experience,
          availability,
          zone,
          tone,
          platforms,
          ...(Number.isFinite(rateValue) ? { rate: rateValue } : {}),
        }),
      });
      const data = (await res.json()) as { listing?: Listing; error?: string; code?: string; credits?: number };
      if (!res.ok || !data.listing) {
        if (data.code === "LIMIT_REACHED") {
          setUsed(limit ?? used);
          setCredits(0);
        }
        throw new Error(data.error ?? "La génération a échoué.");
      }
      setFresh(data.listing);
      setListings((prev) => [data.listing!, ...prev]);
      setUsed((n) => n + 1);
      if (typeof data.credits === "number") setCredits(data.credits);
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
            {limitReached && credits > 0 ? (
              // Quota du plan épuisé mais crédits disponibles : pas de barre d'alerte, la génération reste possible.
              <div className="flex justify-between text-sm">
                <span>Crédits d'annonces restants{expiry}</span>
                <span className="font-medium">{credits}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span>{period === "day" ? "Annonces générées aujourd'hui" : "Annonces générées ce mois-ci"}</span>
                  <span className="font-medium">{Math.min(used, limit)}/{limit}</span>
                </div>
                <Progress value={(Math.min(used, limit) / limit) * 100} indicatorClassName={limitReached ? "bg-destructive" : undefined} />
                {credits > 0 && <p className="text-sm text-muted-foreground">Crédits d'annonces restants : {credits}{expiry}</p>}
              </>
            )}
            {blocked && (
              <p className="text-sm">
                Limite atteinte. <Link href="/pricing" onClick={() => track("paywall_click", { source: "listings" })} className="font-medium text-primary underline">Voir les packs et abonnements</Link> pour générer d'autres annonces.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Votre annonce sur mesure</CardTitle>
          <CardDescription>
            Plus vous en dites sur vous, plus l'annonce vous ressemble. Une seule demande vous donne une version pour chaque site choisi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="service">Ce que vous proposez</Label>
                <Input id="service" required minLength={3} maxLength={120} placeholder="Ex. : Petit bricolage à domicile" value={service} onChange={(e) => setService(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Votre ville</Label>
                <Input id="city" required minLength={2} maxLength={80} placeholder="Ex. : Bordeaux" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Ce que vous savez faire, et votre matériel</Label>
              <Textarea id="skills" maxLength={400} rows={3} placeholder="Ex. : Je pose des étagères et des luminaires. J'ai ma perceuse et mes outils." value={skills} onChange={(e) => setSkills(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Votre expérience (facultatif)</Label>
              <Textarea id="experience" maxLength={300} rows={2} placeholder="Ex. : Je bricole depuis longtemps pour ma famille et mes voisins." value={experience} onChange={(e) => setExperience(e.target.value)} />
              <p className="text-xs text-muted-foreground">N'écrivez que ce qui est vrai : l'annonce reprend vos mots, sans rien inventer.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="availability">Quand êtes-vous disponible ? (facultatif)</Label>
                <Input id="availability" maxLength={200} placeholder="Ex. : Les soirs et le samedi" value={availability} onChange={(e) => setAvailability(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">Jusqu'où vous déplacez-vous ? (facultatif)</Label>
                <Input id="zone" maxLength={150} placeholder="Ex. : Dans un rayon de 10 km" value={zone} onChange={(e) => setZone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Votre prix par heure, en € (facultatif)</Label>
                <Input id="rate" inputMode="decimal" pattern="[0-9]+([.,][0-9]+)?" maxLength={6} placeholder="Ex. : 25" value={rate} onChange={(e) => setRate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">Style de l'annonce</Label>
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  className="flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {TONES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Où voulez-vous publier ?</legend>
              <p className="text-xs text-muted-foreground">
                Choisissez jusqu'à {MAX_PLATFORMS_PER_LISTING} sites. Nous avons coché ceux qui conviennent le mieux à votre activité. {platforms.length} choisi{platforms.length > 1 ? "s" : ""} sur {MAX_PLATFORMS_PER_LISTING}.
              </p>
              {PLATFORM_GROUPS.map((group) => {
                const items = (Object.keys(PLATFORMS) as Platform[]).filter((p) => PLATFORMS[p].group === group.id);
                return (
                  <div key={group.id} className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((p) => {
                        const on = platforms.includes(p);
                        const full = !on && platforms.length >= MAX_PLATFORMS_PER_LISTING;
                        return (
                          <label
                            key={p}
                            className={`flex min-h-[44px] cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm ${on ? "border-primary bg-accent" : "bg-card"} ${full ? "cursor-not-allowed opacity-50" : "hover:bg-accent/50"}`}
                          >
                            <input type="checkbox" checked={on} disabled={full} onChange={() => togglePlatform(p)} className="mt-1 h-4 w-4 shrink-0" />
                            <span>
                              <span className="font-medium">{PLATFORMS[p].label}</span>
                              {PLATFORMS[p].note && <span className="block text-xs text-muted-foreground">{PLATFORMS[p].note}</span>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </fieldset>
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading || blocked || platforms.length === 0}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Rédaction en cours…" : platforms.length > 1 ? `Écrire mon annonce pour ${platforms.length} sites` : "Écrire mon annonce"}
            </Button>
            <p className="text-xs text-muted-foreground">Compte pour une seule annonce de votre quota, quel que soit le nombre de sites choisis.</p>
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
