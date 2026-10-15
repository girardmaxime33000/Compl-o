import { PUBLIC_PAGES } from "@/lib/seo";
import {
  articleJsonLd, breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, serializeJsonLd, softwareApplicationJsonLd,
  webApplicationJsonLd, type BreadcrumbItem, type FaqItem, type JsonLdObject,
} from "@/lib/seo/jsonld";

function JsonLd({ data }: { data: JsonLdObject }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

export function OrganizationJsonLd() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={softwareApplicationJsonLd()} />
    </>
  );
}

export function BreadcrumbJsonLd({ path, items }: { path: string; items?: BreadcrumbItem[] }) {
  const page = PUBLIC_PAGES.find((p) => p.path === path);
  const trail = items ?? (page && path !== "/" ? [{ name: page.name, path }] : null);
  if (!trail) return null;
  return <JsonLd data={breadcrumbJsonLd(trail)} />;
}

export function ArticleJsonLd(props: Parameters<typeof articleJsonLd>[0]) {
  return <JsonLd data={articleJsonLd(props)} />;
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  return items.length > 0 ? <JsonLd data={faqPageJsonLd(items)} /> : null;
}

export function WebApplicationJsonLd(props: Parameters<typeof webApplicationJsonLd>[0]) {
  return <JsonLd data={webApplicationJsonLd(props)} />;
}
