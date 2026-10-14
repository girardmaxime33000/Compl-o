"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, OctagonAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { eur, simulate, TAX_PARAMS, type ActivityRegime, type AlertLevel } from "@/lib/tax";

const LEVEL_STYLE: Record<AlertLevel, { box: string; bar: string; Icon: typeof CheckCircle2 }> = {
  ok: { box: "border-success/30 bg-success/5", bar: "bg-success", Icon: CheckCircle2 },
  warning: { box: "border-amber-400 bg-amber-50", bar: "bg-amber-500", Icon: AlertTriangle },
  danger: { box: "border-destructive/50 bg-destructive/5", bar: "bg-destructive", Icon: OctagonAlert },
};

const num = (v: string) => (v === "" ? 0 : Number(v.replace(",", ".")) || 0);

export function Simulator({ initialRevenue = 500, initialRegime = "bnc" }: { initialRevenue?: number; initialRegime?: ActivityRegime }) {
  const [revenue, setRevenue] = useState(String(initialRevenue));
  const [regime, setRegime] = useState<ActivityRegime>(initialRegime);
  const [areOn, setAreOn] = useState(false);
  const [are, setAre] = useState("1200");
  const [reference, setReference] = useState("");

  const result = useMemo(
    () =>
      simulate({
        monthlyRevenue: num(revenue),
        regime,
        unemployment: { enabled: areOn, monthlyAre: num(are), referenceSalary: num(reference) },
      }),
    [revenue, regime, areOn, are, reference],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Vos paramètres</CardTitle>
          <CardDescription>Prestation de services en micro-entreprise.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="revenue">Chiffre d'affaires mensuel visé (€)</Label>
            <Input id="revenue" inputMode="decimal" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
            <input
              type="range" min={0} max={6000} step={50} aria-label="Chiffre d'affaires mensuel"
              value={num(revenue)} onChange={(e) => setRevenue(e.target.value)}
              className="w-full accent-[hsl(var(--primary))]"
            />
          </div>

          <div className="space-y-2">
            <Label>Type d'activité</Label>
            <Tabs value={regime} onValueChange={(v) => setRegime(v as ActivityRegime)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bnc">BNC · {(TAX_PARAMS.urssafRate.bnc * 100).toFixed(1)} %</TabsTrigger>
                <TabsTrigger value="bic">BIC · {(TAX_PARAMS.urssafRate.bic * 100).toFixed(1)} %</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              BNC : cours, conseil, informatique… BIC : bricolage, ménage, livraison, services artisanaux.
            </p>
          </div>

          <div className="space-y-4 rounded-md border p-4">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="are-toggle" className="leading-snug">Je perçois le chômage (ARE / France Travail)</Label>
              <Switch id="are-toggle" checked={areOn} onCheckedChange={setAreOn} />
            </div>
            {areOn && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="are">ARE mensuelle (€)</Label>
                  <Input id="are" inputMode="decimal" value={are} onChange={(e) => setAre(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ref">Ancien salaire mensuel (€, optionnel)</Label>
                  <Input id="ref" inputMode="decimal" placeholder="Plafonne le cumul" value={reference} onChange={(e) => setReference(e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-success/40">
          <CardHeader>
            <CardDescription>Net avant impôts</CardDescription>
            <p className="text-4xl font-bold text-success" aria-live="polite">{eur(result.netMonthly)}<span className="text-base font-normal text-muted-foreground"> / mois</span></p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Chiffre d'affaires" value={eur(result.monthlyRevenue)} />
            <Row label={`Cotisations URSSAF (${(result.urssafRate * 100).toFixed(1)} %)`} value={`− ${eur(result.urssaf)}`} />
            <Row label="Net annuel estimé" value={eur(result.netAnnual)} strong />
          </CardContent>
        </Card>

        {result.unemployment && (
          <Card>
            <CardHeader>
              <CardTitle>Cumul avec le chômage</CardTitle>
              <CardDescription>Estimation indicative : seul France Travail fait foi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Revenu d'activité retenu (après abattement)" value={eur(result.unemployment.retainedIncome)} />
              <Row label="Réduction de l'ARE (70 % du revenu retenu)" value={`− ${eur(result.unemployment.areReduction)}`} />
              <Row label="ARE versée estimée" value={eur(result.unemployment.areAfterCumul)} />
              <Row label="Total mensuel (ARE + net activité)" value={eur(result.unemployment.totalMonthly)} strong />
              {result.unemployment.capped && (
                <p className="text-amber-700">Le cumul est plafonné à votre ancien salaire de référence.</p>
              )}
              <p className="pt-1 text-xs text-muted-foreground">Déclarez votre chiffre d'affaires chaque mois à France Travail.</p>
            </CardContent>
          </Card>
        )}

        <section className="space-y-3" aria-label="Plafonds réglementaires">
          {result.alerts.map((a) => {
            const { box, bar, Icon } = LEVEL_STYLE[a.level];
            return (
              <div key={a.id} className={cn("space-y-2 rounded-lg border p-4", box)} role={a.level === "ok" ? undefined : "alert"}>
                <div className="flex items-center gap-2 font-medium">
                  <Icon className="h-4 w-4 shrink-0" /> {a.label}
                </div>
                <Progress value={a.ratio * 100} indicatorClassName={bar} />
                <p className="text-xs">{eur(a.annualRevenue)} / {eur(a.threshold)} par an</p>
                <p className="text-sm">{a.message}</p>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4", strong && "border-t pt-2 font-semibold")}>
      <span className={strong ? undefined : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
