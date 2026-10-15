import { pageMetadata, NOINDEX } from "@/lib/seo";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/marketing/login-form";
import { safeNext } from "@/lib/auth";
import { Photo } from "@/components/marketing/photo";
import { sitePhoto } from "@/lib/site-images";
import { cn } from "@/lib/utils";

export const metadata = { title: "Connexion | Compléo", ...NOINDEX };

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  const photo = sitePhoto("login");
  return (
    <main className={cn("container min-h-screen py-10", photo ? "grid items-center gap-10 lg:grid-cols-2" : "flex flex-col items-center justify-center")}>
      <div className="flex flex-col items-center">
        <Link href="/" className="mb-6 flex items-center gap-2 text-xl font-bold text-primary">
          <Rocket className="h-6 w-6" /> Compléo
        </Link>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Sans mot de passe : un lien magique ou votre compte Google.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm next={safeNext(searchParams.next)} initialError={searchParams.error === "auth"} />
          </CardContent>
        </Card>
      </div>
      {/* Colonne photo réservée aux grands écrans : sur mobile, le formulaire reste seul et immédiat. */}
      <Photo photo={photo} alt="" ratio="portrait" sizes="560px" className="hidden rounded-2xl lg:block" />
    </main>
  );
}
