import { newsletterEnabled } from "@/lib/newsletter";
import { NewsletterForm } from "@/components/blog/newsletter-form";

/** N'affiche rien tant que NEWSLETTER_ENABLED n'est pas "true" (valeur lue au build : redéployer après changement). */
export function NewsletterSignup({ source }: { source: string }) {
  if (!newsletterEnabled()) return null;
  return <NewsletterForm source={source} />;
}
