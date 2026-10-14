"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export function ManageSubscription() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function open() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Portail indisponible.");
      window.location.href = data.url;
    } catch (e) {
      toast(e instanceof Error ? e.message : "Portail indisponible.", "error");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre abonnement</CardTitle>
        <CardDescription>Modifier votre moyen de paiement, télécharger vos reçus ou résilier.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={open} disabled={loading}>Gérer mon abonnement</Button>
      </CardContent>
    </Card>
  );
}
