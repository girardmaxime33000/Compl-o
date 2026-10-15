import Link from "next/link";
import { Info } from "lucide-react";
import type { EquipmentLine, PriceLine, UrbanActivity } from "@/lib/urban-activities";
import { publishedUrbanActivities } from "@/lib/urban-activities";
import { cmaNotice, computeMonthlyNetIncome, renderAd } from "@/lib/urban-income";
import { LEGAL } from "@/lib/legal";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { PublicCtas } from "@/components/marketing/ctas";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { UrbanPlanner } from "@/components/activities/urban-planner";
import { Photo } from "@/components/marketing/photo";
import { urbanPhoto } from "@/lib/site-images";
import { StickyCta } from "@/components/marketing/sticky-cta";
import { SiteHeader } from "@/components/marketing/site-header";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n);
const range = (min: number, max: number) => (min === max ? `${fmt(min)}` : `${fmt(min)} à ${fmt(max)}`);
const UNITS: Record<PriceLine["unit"], string> = { HOUR: "€ / h", SERVICE: "€ / prestation", MONTH: "€ / mois", ITEM: "€ / unité", PERCENT: "%" };
const BARRIERS = { LOW: "Faible", MEDIUM: "Moyenne", HIGH: "Élevée" } as const;
const eur = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/** Liste empilée sous 640 px, ligne à deux colonnes au-delà (remplace un tableau). */
function Rows({ items, label }: { items: { key: string; title: string; note?: string; value: string }[]; label: string }) {
  return (
    <ul className="divide-y rounded-lg border text-sm" aria-label={label}>
      {items.map((i) => (
        <li key={i.key} className="flex flex-col gap-1 p-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <span>
            {i.title}
            {i.note && <span className="block text-xs text-muted-foreground">{i.note}</span>}
          </span>
          <span className="font-medium sm:shrink-0 sm:text-right">{i.value}</span>
        </li>
      ))}
    </ul>
  );
}

const equipmentValue = (e: EquipmentLine) =>
  `${range(e.minEur, e.maxEur)} €${e.recurring === "YEARLY" ? " / an" : ""}${e.note ? ` (${e.note})` : ""}`;

export function UrbanSheet({ activity }: { activity: UrbanActivity }) {
  const path = `/activites/${activity.slug}`;
  const occasional = computeMonthlyNetIncome(activity, "OCCASIONAL");
  const regular = computeMonthlyNetIncome(activity, "REGULAR");
  const ad = renderAd(activity, { values: { quartier: "votre quartier" } });
  const notice = cmaNotice(activity);
  const upfront = (activity.equipment ?? []).filter((e) => e.recurring !== "YEARLY");

  return (
    <>
      <BreadcrumbJsonLd path={path} items={[{ name: "Activités", path: "/activites" }, { name: activity.name, path }]} />
      <SiteHeader />
      <main className="container max-w-4xl space-y-10 py-10">
        <Photo
          photo={urbanPhoto(activity.slug)}
          alt=""
          ratio="banner"
          sizes="(min-width: 896px) 864px, 100vw"
          priority
          className="rounded-2xl [&_img]:max-h-56 sm:[&_img]:max-h-72"
        />

        <div>
          <p className="text-sm text-muted-foreground"><Link href="/activites" className="underline">Activités</Link> / {activity.name}</p>
          <h1 className="mt-1 text-3xl font-bold">{activity.name} : tarifs, matériel et revenu estimé</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{activity.pitch}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activity.entryBarrier && <Badge variant="muted">Barrière d'entrée : {BARRIERS[activity.entryBarrier]}</Badge>}
            {activity.sapEligibility !== "NONE" && <Badge variant="default">Éligible au crédit d'impôt SAP (sous conditions)</Badge>}
          </div>
        </div>

        {notice && (
          <div role="note" className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{notice}</p>
          </div>
        )}

        {activity.painPoints && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Les besoins auxquels vous répondez</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">{activity.painPoints.map((p) => <li key={p}>{p}</li>)}</ul>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Tarifs indicatifs</h2>
          <Rows
            label="Tarifs indicatifs"
            items={activity.pricing.map((p) => ({ key: p.label, title: p.label, note: p.note, value: `${range(p.minEur, p.maxEur)} ${UNITS[p.unit]}` }))}
          />
          <p className="text-xs text-muted-foreground">Fourchettes indicatives, à adapter à votre zone et à votre situation.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Revenu net mensuel estimé</h2>
          <Rows
            label="Revenu net mensuel estimé"
            items={[
              { key: "o", title: "Profil occasionnel", note: `${occasional.composition ?? "4 h facturées par semaine"}`, value: `≈ ${eur(occasional.netDisplay)} net` },
              { key: "r", title: "Profil régulier", note: `${regular.composition ?? "12 h facturées par semaine"}`, value: `≈ ${eur(regular.netDisplay)} net` },
            ]}
          />
          <p className="text-xs text-muted-foreground">
            Estimation selon profil et temps disponible, sans garantie de revenu. Net = chiffre d'affaires moins cotisations
            micro-entrepreneur et charges d'exploitation indicatives, avant impôt sur le revenu.
            {activity.taxCategoryToConfirm && " La classification BNC ou BIC est à confirmer à l'immatriculation."}
          </p>
          <p className="text-sm text-muted-foreground">{activity.capacityNote}</p>
        </section>

        {activity.equipment && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Matériel et assurances</h2>
            <Rows
              label="Matériel et assurances"
              items={activity.equipment.map((e) => ({ key: e.label, title: e.label, value: equipmentValue(e) }))}
            />
            {upfront.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Investissement initial indicatif : {eur(upfront.reduce((s, e) => s + e.minEur, 0))} à{" "}
                {eur(upfront.reduce((s, e) => s + e.maxEur, 0))}, hors assurance annuelle.
              </p>
            )}
          </section>
        )}

        {(activity.skills?.length || activity.certifications?.length) ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Compétences</h2>
            {activity.skills && <ul className="list-disc space-y-1 pl-5 text-sm">{activity.skills.map((s) => <li key={s}>{s}</li>)}</ul>}
            {activity.certifications && activity.certifications.length > 0 && (
              <p className="text-sm text-muted-foreground">Certifications : {activity.certifications.join(", ")}.</p>
            )}
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Réglementation à vérifier</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">{activity.regulatoryNotes.map((n) => <li key={n}>{n}</li>)}</ul>
          <p className="text-xs text-muted-foreground">
            Repères indicatifs, sans valeur de conseil juridique ou fiscal. Vérifiez sur{" "}
            <a className="underline" href="https://www.urssaf.fr" rel="noopener noreferrer">urssaf.fr</a> et{" "}
            <a className="underline" href="https://entreprendre.service-public.fr" rel="noopener noreferrer">entreprendre.service-public.fr</a>.
          </p>
        </section>

        {activity.risks && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Risques et parades</h2>
            <Rows label="Risques et parades" items={activity.risks.map((r) => ({ key: r.label, title: r.label, value: r.mitigation }))} />
          </section>
        )}

        {activity.acquisitionChannels && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Où trouver vos premiers clients</h2>
            <Rows label="Canaux d'acquisition" items={activity.acquisitionChannels.map((c) => ({ key: c.channel, title: c.channel, value: c.usage }))} />
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Exemple d'annonce</h2>
          <Card>
            <CardHeader><CardDescription>Modèle à adapter : annonce à relire avant publication.</CardDescription></CardHeader>
            <CardContent><p className="text-sm leading-relaxed">{ad.text}</p></CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Combiner plusieurs activités</h2>
          <UrbanPlanner activities={publishedUrbanActivities()} initialSlug={activity.slug} />
        </section>

        <div role="note" className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Estimation indicative, ne constitue pas un conseil fiscal. Dernière mise à jour : {LEGAL.lastUpdate}.</p>
        </div>

        <section className="space-y-3 rounded-lg border border-primary/40 p-5">
          <h2 className="text-lg font-semibold">Passez à l'action</h2>
          <p className="text-sm text-muted-foreground">
            Faites le diagnostic gratuit pour comparer cette activité à votre profil, sans inscription, ou estimez votre
            net après cotisations.
          </p>
          <PublicCtas />
        </section>
      </main>
      <SiteFooter />
      <StickyCta />
    </>
  );
}
