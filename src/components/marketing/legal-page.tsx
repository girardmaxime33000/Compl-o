import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { LEGAL } from "@/lib/legal";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

export function LegalPage({ title, path, children }: { title: string; path: string; children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd path={path} />
      <SiteHeader />
      <main className="container max-w-3xl space-y-8 py-10">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Dernière mise à jour : {LEGAL.lastUpdate}</p>
        </div>
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Texte en brouillon : il n'a pas été relu par un juriste et ne doit pas être considéré comme validé.
        </p>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
