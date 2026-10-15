import Link from "next/link";
import { notFound } from "next/navigation";
import { DEFAULT_CTA, findGuide, GUIDES, guidePath } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { FaqSection } from "@/components/marketing/faq";
import { Button } from "@/components/ui/button";
import { GuideVisual } from "@/components/marketing/visuals";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const guide = findGuide(params.slug);
  if (!guide) return {};
  return pageMetadata({ title: guide.title, description: guide.description, path: guidePath(guide) });
}

const fmt = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = findGuide(params.slug);
  if (!guide) notFound();
  const { Content } = guide;
  const cta = guide.cta ?? DEFAULT_CTA;

  return (
    <>
      <BreadcrumbJsonLd path={guidePath(guide)} items={[{ name: "Guides", path: "/guides" }, { name: guide.title, path: guidePath(guide) }]} />
      <ArticleJsonLd title={guide.title} description={guide.description} path={guidePath(guide)} published={guide.published} updated={guide.updated} imagePath={`${guidePath(guide)}/opengraph-image`} />
      <SiteHeader />
      <main className="container max-w-3xl space-y-8 py-10">
        <div>
          <p className="text-sm text-muted-foreground"><Link href="/guides" className="underline">Guides</Link> / {guide.title}</p>
          <h1 className="mt-1 text-3xl font-bold">{guide.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Mis à jour le {fmt(guide.updated)}</p>
        </div>
        <GuideVisual slug={guide.slug} size="hero" />
        <Content />
        {guide.faq && <FaqSection items={guide.faq} />}
        <section className="space-y-3 rounded-lg border border-primary/40 p-5">
          <h2 className="text-lg font-semibold">{cta.title}</h2>
          <p className="text-sm text-muted-foreground">{cta.text}</p>
          <Button asChild size="lg"><Link href={cta.href}>{cta.label}</Link></Button>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
