import Link from "next/link";
import { Calculator, FileText, Megaphone, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SiteFooter } from "@/components/marketing/site-footer";

const FEATURES = [
  { icon: Sparkles, title: "Trouvez votre activité", text: "3 questions, 3 idées de micro-activités avec tarifs et plateformes adaptés." },
  { icon: Megaphone, title: "Annonces rédigées par IA", text: "Titre, avantages, tarifs et hashtags pour LeBonCoin, AlloVoisins ou GensDeConfiance." },
  { icon: Calculator, title: "Net dans la poche", text: "Cotisations URSSAF, plafonds de TVA et cumul avec le chômage en temps réel." },
  { icon: FileText, title: "Factures en 1 minute", text: "Devis et factures PDF sans TVA, avec les mentions obligatoires." },
];

export default function HomePage() {
  return (
    <main>
      <header className="container flex h-14 items-center justify-between">
        <span className="flex items-center gap-2 font-bold text-primary"><Rocket className="h-5 w-5" /> Compléo</span>
        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm"><Link href="/simulateur-micro-entrepreneur">Simulateur</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link href="/pricing">Tarifs</Link></Button>
          <Button asChild size="sm"><Link href="/login">Connexion</Link></Button>
        </nav>
      </header>

      <section className="container py-14 text-center md:py-24">
        <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
          Gagnez <span className="text-success">200 € à 1 000 € de plus</span> par mois, simplement.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">
          Compléo vous guide dans le choix d'une micro-activité, rédige vos annonces et calcule ce qu'il vous reste vraiment.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg"><Link href="/onboarding">Faire mon diagnostic gratuit</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/pricing">Voir les tarifs</Link></Button>
        </div>
      </section>

      <section className="container grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="h-6 w-6 text-primary" />
              <CardTitle>{title}</CardTitle>
              <CardDescription>{text}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
