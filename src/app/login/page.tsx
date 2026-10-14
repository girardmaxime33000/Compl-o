import Link from "next/link";
import { Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/marketing/login-form";
import { safeNext } from "@/lib/auth";

export const metadata = { title: "Connexion · JobBoost FR" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center py-10">
      <Link href="/" className="mb-6 flex items-center gap-2 text-xl font-bold text-primary">
        <Rocket className="h-6 w-6" /> JobBoost FR
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
    </main>
  );
}
