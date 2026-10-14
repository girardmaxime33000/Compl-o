"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function CheckoutButton({ label = "Passer Premium" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function start() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (res.status === 401) {
        window.location.href = "/login?next=/pricing";
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Paiement indisponible.");
      window.location.href = data.url;
    } catch (e) {
      toast(e instanceof Error ? e.message : "Paiement indisponible.", "error");
      setLoading(false);
    }
  }

  return (
    <Button onClick={start} disabled={loading} size="lg" className="w-full">
      {loading && <Loader2 className="h-4 w-4 animate-spin" />} {label}
    </Button>
  );
}
