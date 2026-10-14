import Link from "next/link";
import { LogOut, Rocket } from "lucide-react";
import { requireUser, isPremium } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import { DashboardNav } from "@/components/dashboard/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary">
            <Rocket className="h-5 w-5" /> Compléo
          </Link>
          <DashboardNav />
          <div className="flex items-center gap-2">
            {isPremium(profile) ? (
              <Badge variant="success">Premium</Badge>
            ) : (
              <Link href="/pricing"><Badge>Gratuit</Badge></Link>
            )}
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="icon" aria-label="Se déconnecter">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container py-6 md:py-8">{children}</main>
    </div>
  );
}
