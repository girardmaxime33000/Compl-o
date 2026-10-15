import Link from "next/link";
import { Button } from "@/components/ui/button";

/** CTA principal (diagnostic) et CTA secondaire (simulateur) des pages publiques. */
export function PublicCtas({ className }: { className?: string }) {
  return (
    <div className={className ?? "flex flex-col gap-3 sm:flex-row"}>
      <Button asChild size="lg"><Link href="/onboarding">Faire mon diagnostic gratuit</Link></Button>
      <Button asChild size="lg" variant="outline"><Link href="/simulateur-micro-entrepreneur">Estimer mon net</Link></Button>
    </div>
  );
}
