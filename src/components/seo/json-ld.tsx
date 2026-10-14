import { LEGAL } from "@/lib/legal";
import { absoluteUrl, PUBLIC_PAGES } from "@/lib/seo";
import { centsToDecimal, OFFERS } from "@/lib/offers";

function JsonLd({ data }: { data: object }) {
  // Échappe "<" pour qu'aucune balise ne puisse fermer le script.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function OrganizationJsonLd() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: LEGAL.siteName,
          url: absoluteUrl("/"),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: LEGAL.siteName,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: absoluteUrl("/"),
          inLanguage: "fr-FR",
          offers: [
            { "@type": "Offer", name: "Gratuit", price: "0", priceCurrency: "EUR" },
            ...Object.values(OFFERS).map((o) => ({
              "@type": "Offer",
              name: o.name,
              price: centsToDecimal(o.cents),
              priceCurrency: "EUR",
            })),
          ],
        }}
      />
    </>
  );
}

export function BreadcrumbJsonLd({ path, items }: { path: string; items?: { name: string; path: string }[] }) {
  const page = PUBLIC_PAGES.find((p) => p.path === path);
  const trail = items ?? (page && path !== "/" ? [{ name: page.name, path }] : null);
  if (!trail) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [{ name: "Accueil", path: "/" }, ...trail].map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: absoluteUrl(it.path),
        })),
      }}
    />
  );
}
