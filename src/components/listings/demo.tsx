"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ACTIVITIES } from "@/lib/activities";
import { DEMO_LISTINGS } from "@/lib/demo-listings";

export function ListingDemo() {
  const [selected, setSelected] = useState(ACTIVITIES[0]?.id ?? "");
  const listing = DEMO_LISTINGS.find((l) => l.activityId === selected) ?? DEMO_LISTINGS[0];
  if (!listing) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choisir une activité">
        {ACTIVITIES.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setSelected(a.id)}
            aria-pressed={selected === a.id}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              selected === a.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {a.title}
          </button>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardDescription>Exemple d'annonce, rédigé à l'avance (pas de génération en direct)</CardDescription>
          <CardTitle as="h2" className="text-xl">{listing.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm leading-relaxed">{listing.body}</p>
          <p className="mt-4 text-xs text-muted-foreground">Exemple à relire et adapter avant publication.</p>
        </CardContent>
      </Card>
    </div>
  );
}
