"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, Megaphone, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/dashboard/listings", label: "Annonces", icon: Megaphone },
  { href: "/dashboard/simulator", label: "Simulateur", icon: Calculator },
  { href: "/dashboard/invoices", label: "Factures", icon: FileText },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <>
      {/* Bureau */}
      <nav className="hidden items-center gap-1 md:flex">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
              pathname === href && "bg-accent text-primary",
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </nav>
      {/* Mobile : barre fixe en bas */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-card md:hidden" aria-label="Navigation principale">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-xs text-muted-foreground",
              pathname === href && "font-semibold text-primary",
            )}
          >
            <Icon className="h-5 w-5" /> {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
