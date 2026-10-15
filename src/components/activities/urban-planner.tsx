"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Info } from "lucide-react";
import type { Profile, UrbanActivity } from "@/lib/urban-activities";
import {
  cmaNotice, computeMonthlyNetIncome, hasSapConflict, renderAd, SAP_CONFLICT_MESSAGE, vatAlert,
} from "@/lib/urban-income";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const eur = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

function Alert({ children, tone }: { children: React.ReactNode; tone: "warning" | "info" }) {
  const Icon = tone === "warning" ? AlertTriangle : Info;
  return (
    <div role="note" className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

/**
 * Combinaison d'activités : net estimé par activité et cumulé (R1), alerte TVA sur le CA de services cumulé (R2),
 * alerte d'exclusivité SAP avant l'immatriculation (R3), message CMA (R4) et annonces (R5).
 */
export function UrbanPlanner({ activities, initialSlug }: { activities: UrbanActivity[]; initialSlug: string }) {
  const [selected, setSelected] = useState<string[]>([initialSlug]);
  const [profile, setProfile] = useState<Profile>("OCCASIONAL");
  const [sapDeclared, setSapDeclared] = useState(false);
  const [acre, setAcre] = useState(false);
  const [startDate, setStartDate] = useState("2026-07-01");
  const [quartier, setQuartier] = useState("");

  const chosen = useMemo(() => activities.filter((a) => selected.includes(a.slug)), [activities, selected]);
  const acreOptions = acre && startDate ? { acre: { startDate } } : {};
  const results = chosen.map((activity) => ({ activity, net: computeMonthlyNetIncome(activity, profile, acreOptions) }));
  const total = results.reduce((sum, r) => sum + r.net.netIncome, 0);
  const vat = vatAlert(chosen.map((activity) => ({ activity, profile })));
  const conflict = hasSapConflict(chosen);

  const toggle = (slug: string) =>
    setSelected((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));

  return (
    <div className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Activités combinées</legend>
        {activities.map((a) => (
          <label key={a.slug} className="flex min-h-11 items-center gap-3 rounded-md border p-3 text-sm">
            <input type="checkbox" className="h-4 w-4" checked={selected.includes(a.slug)} onChange={() => toggle(a.slug)} />
            {a.name}
          </label>
        ))}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Profil</span>
          <select
            className="h-11 w-full rounded-md border border-input bg-card px-3 text-base md:text-sm"
            value={profile}
            onChange={(e) => setProfile(e.target.value as Profile)}
          >
            <option value="OCCASIONAL">Occasionnel (4 h facturées par semaine)</option>
            <option value="REGULAR">Régulier (12 h facturées par semaine)</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Quartier (pour les annonces)</span>
          <Input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="Ex. : Saint-Michel" />
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" className="h-4 w-4" checked={sapDeclared} onChange={(e) => setSapDeclared(e.target.checked)} />
          Je me déclare en services à la personne (SAP)
        </label>
        <div className="space-y-2 text-sm">
          <label className="flex min-h-11 items-center gap-3">
            <input type="checkbox" className="h-4 w-4" checked={acre} onChange={(e) => setAcre(e.target.checked)} />
            Je bénéficie de l'ACRE
          </label>
          {acre && (
            <label className="block space-y-1">
              <span className="font-medium">Date de début d'activité</span>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
          )}
        </div>
      </div>

      {chosen.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sélectionnez au moins une activité.</p>
      ) : (
        <>
          <ul className="divide-y rounded-lg border text-sm" aria-label="Net mensuel estimé par activité">
            {results.map(({ activity, net }) => (
              <li key={activity.slug} className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{activity.name}</span>
                <span className="font-semibold">≈ {eur(net.netDisplay)} net / mois</span>
              </li>
            ))}
            <li className="flex flex-col gap-1 bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium">Total estimé (avant impôt sur le revenu)</span>
              <span className="font-semibold">≈ {eur(Math.round(total / 10) * 10)} net / mois</span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Estimation selon profil et temps disponible, sans garantie de revenu : chiffre d'affaires moins cotisations
            et charges d'exploitation indicatives. Les heures facturées de chaque activité sont ajoutées : vérifiez
            que le total reste réaliste.
          </p>

          {vat.triggered && (
            <Alert tone="warning">
              Chiffre d'affaires annuel de services estimé à {eur(vat.annualServicesRevenue)} : vous approchez ou dépassez
              90 % du seuil de franchise de TVA ({eur(vat.franchiseThreshold)} par an). Au-delà du seuil, la TVA devient
              exigible.
            </Alert>
          )}
          {conflict && <Alert tone="warning">{SAP_CONFLICT_MESSAGE}</Alert>}
          {chosen.map((a) => {
            const notice = cmaNotice(a);
            return notice ? <Alert key={a.slug} tone="info">{notice}</Alert> : null;
          })}

          <div className="space-y-3">
            <h3 className="font-semibold">Annonces prêtes à relire</h3>
            {chosen.map((a) => {
              const ad = renderAd(a, { values: { quartier: quartier.trim() || "votre quartier" }, sapDeclared, selection: chosen });
              return (
                <Card key={a.slug}>
                  <CardHeader>
                    <CardTitle className="text-base">{a.name}</CardTitle>
                    <CardDescription>Annonce générée à partir d'un modèle, à relire avant publication.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{ad.text}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{ad.length} caractères</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
