import { FaqJsonLd } from "@/components/seo/json-ld";
import type { FaqItem } from "@/lib/seo/jsonld";

/** FAQ rendue côté serveur (éléments <details>, sans JavaScript). Les réponses affichées sont celles du JSON-LD. */
export function FaqSection({ items, title = "Questions fréquentes" }: { items: FaqItem[]; title?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="divide-y rounded-lg border">
        {items.map((it) => (
          <details key={it.question} className="group p-4">
            <summary className="cursor-pointer text-sm font-medium marker:text-muted-foreground">{it.question}</summary>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">{it.answer}</p>
          </details>
        ))}
      </div>
      <FaqJsonLd items={items} />
    </section>
  );
}
