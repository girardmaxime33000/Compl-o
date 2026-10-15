"use client";

import { useState, useTransition } from "react";
import { Download, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { deleteAccount, setEmailTips } from "@/app/actions/account";
import { DELETE_CONFIRMATION } from "@/lib/account";

export function AccountActions({ email, emailTips }: { email: string; emailTips: boolean }) {
  const [tips, setTips] = useState(emailTips);
  const [confirmation, setConfirmation] = useState("");
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function remove(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await deleteAccount(confirmation);
      if (!res.ok) return toast(res.error ?? "Suppression impossible.", "error");
      window.location.assign("/?account=deleted");
    });
  }

  function toggleTips(next: boolean) {
    setTips(next);
    startTransition(async () => {
      const res = await setEmailTips(next);
      if (!res.ok) {
        setTips(!next);
        toast("Enregistrement impossible.", "error");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>E-mails de conseils</CardTitle>
          <CardDescription>
            Quelques e-mails pour bien démarrer et une alerte quand vos factures payées approchent du seuil de TVA ou du
            plafond micro-entrepreneur. Désactivé par défaut, désinscription possible à tout moment. Les e-mails liés à
            un service demandé (envoi d'une facture) ne dépendent pas de ce réglage.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Switch id="email-tips" checked={tips} onCheckedChange={toggleTips} disabled={pending} />
          <Label htmlFor="email-tips">Recevoir les e-mails de conseils et d'alerte</Label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exporter mes données</CardTitle>
          <CardDescription>
            Téléchargez au format JSON votre profil, vos compétences, vos annonces et vos documents ({email}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <a href="/api/account/export" download><Download className="h-4 w-4" /> Télécharger mes données</a>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Supprimer mon compte</CardTitle>
          <CardDescription>
            Suppression définitive de votre compte, de vos annonces, de vos devis et factures et de vos crédits d'annonces
            non utilisés. Votre abonnement éventuel est résilié immédiatement, sans remboursement de la période en cours.
            Pensez à exporter vos données avant. Les données que la loi impose de conserver (facturation de l'abonnement)
            restent chez le prestataire de paiement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={remove} className="space-y-3">
            <Label htmlFor="confirm">Saisissez « {DELETE_CONFIRMATION} » pour confirmer</Label>
            <Input id="confirm" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="off" />
            <Button type="submit" variant="destructive" disabled={pending || confirmation.trim() !== DELETE_CONFIRMATION}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Supprimer définitivement
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
