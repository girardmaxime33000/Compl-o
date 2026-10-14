import { LEGAL } from "@/lib/legal";
import { absoluteUrl, PREMIUM_PRICE_EUR, PUBLIC_PAGES } from "@/lib/seo";

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
            {
              "@type": "Offer",
              name: "Premium",
              price: PREMIUM_PRICE_EUR,
              priceCurrency: "EUR",
              priceSpecification: { "@type": "UnitPriceSpecification", price: PREMIUM_PRICE_EUR, priceCurrency: "EUR", unitCode: "MON" },
            },
          ],
        }}
      />
    </>
  );
}

export function BreadcrumbJsonLd({ path }: { path: string }) {
  const page = PUBLIC_PAGES.find((p) => p.path === path);
  if (!page || path === "/") return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: page.name, item: absoluteUrl(path) },
        ],
      }}
    />
  );
}
