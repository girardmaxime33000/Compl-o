import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/marketing/tracked-link";

/** Appel à l'action de fin d'article, mesuré par `cta_click` (`source` = blog, `article` = slug de l'article d'entrée). */
export function PostCta({ article, cta }: { article: string; cta: { title: string; text: string; label: string; href: string } }) {
  return (
    <section className="space-y-3 rounded-lg border border-primary/40 p-5">
      <h2 className="text-lg font-semibold">{cta.title}</h2>
      <p className="text-sm text-muted-foreground">{cta.text}</p>
      <Button asChild size="lg">
        <TrackedLink href={cta.href} trackProps={{ source: "blog", target: cta.href.replace(/^\//, "").split(/[/?]/)[0] || "accueil", article }}>
          {cta.label}
        </TrackedLink>
      </Button>
    </section>
  );
}
