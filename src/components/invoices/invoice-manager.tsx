"use client";

import { useState, useTransition } from "react";
import { Download, Loader2, Mail, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { createInvoice, deleteInvoice, updateInvoiceStatus } from "@/app/actions/invoices";
import { invoiceNumber, TVA_MENTION } from "@/lib/invoice-number";
import { eur } from "@/lib/tax";
import type { DocumentType, Invoice, InvoiceStatus } from "@/types/database";

const STATUS_LABEL: Record<InvoiceStatus, string> = { draft: "Brouillon", sent: "Envoyé", paid: "Payé" };
const STATUS_ORDER: InvoiceStatus[] = ["draft", "sent", "paid"];

interface Issuer { name: string; siret: string; address: string }

function NewInvoiceDialog({ issuer }: { issuer: Issuer }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<DocumentType>("facture");
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    // Tolère « 25€ », « 25 € » ou « 25,50 » : ne garde que chiffres et séparateur décimal.
    const amount = Number(String(f.get("amount")).replace(/[^\d.,]/g, "").replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return toast("Montant invalide : saisissez un nombre, par exemple 25 ou 25,50.", "error");
    startTransition(async () => {
      const res = await createInvoice({
        documentType: type,
        clientName: String(f.get("clientName")),
        description: String(f.get("description")),
        amount,
        issueDate: String(f.get("issueDate")),
        issuerName: String(f.get("issuerName")),
        issuerSiret: String(f.get("issuerSiret")),
        issuerAddress: String(f.get("issuerAddress")),
      });
      if (!res.ok) return toast(res.error ?? "Création impossible.", "error");
      toast("Document créé.");
      setOpen(false);
      if (res.id) window.location.assign(`/api/invoices/${res.id}/pdf`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Nouveau document</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau devis ou facture</DialogTitle>
          <DialogDescription>
            {TVA_MENTION}. Le PDF se télécharge à la création. Le numéro est attribué automatiquement dans l'ordre chronologique ; une facture créée ne peut plus être modifiée ni supprimée.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type de document</Label>
            <Select value={type} onValueChange={(v) => setType(v as DocumentType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="facture">Facture</SelectItem>
                <SelectItem value="devis">Devis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label htmlFor="clientName">Client</Label><Input id="clientName" name="clientName" required minLength={2} /></div>
          <div className="space-y-2"><Label htmlFor="description">Prestation</Label><Textarea id="description" name="description" required minLength={3} maxLength={500} className="min-h-[80px]" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="amount">Montant (€)</Label><Input id="amount" name="amount" inputMode="decimal" required /></div>
            <div className="space-y-2"><Label htmlFor="issueDate">Date</Label><Input id="issueDate" name="issueDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          </div>
          <fieldset className="space-y-3 rounded-md border p-3">
            <legend className="px-1 text-sm font-medium">Vos informations</legend>
            <div className="space-y-2"><Label htmlFor="issuerName">Nom / raison sociale</Label><Input id="issuerName" name="issuerName" required defaultValue={issuer.name} /></div>
            <div className="space-y-2"><Label htmlFor="issuerSiret">SIRET (14 chiffres)</Label><Input id="issuerSiret" name="issuerSiret" required inputMode="numeric" defaultValue={issuer.siret} /></div>
            <div className="space-y-2"><Label htmlFor="issuerAddress">Adresse</Label><Input id="issuerAddress" name="issuerAddress" required defaultValue={issuer.address} /></div>
          </fieldset>
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Créer et télécharger le PDF
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SendDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const to = String(new FormData(e.currentTarget).get("to"));
    startTransition(async () => {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) return toast(data.error ?? "Envoi impossible.", "error");
      toast("Document envoyé.");
      setOpen(false);
      window.location.reload();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Envoyer par e-mail"><Mail className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer {invoiceNumber(invoice)} par e-mail</DialogTitle>
          <DialogDescription>
            Le PDF est joint. Votre client peut vous répondre directement. L'adresse saisie n'est pas conservée.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`to-${invoice.id}`}>E-mail du client</Label>
            <Input id={`to-${invoice.id}`} name="to" type="email" required maxLength={254} autoComplete="off" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Envoyer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{invoiceNumber(invoice)}</span>
            <Badge variant="muted">{invoice.document_type === "devis" ? "Devis" : "Facture"}</Badge>
            <Badge variant={invoice.status === "paid" ? "success" : "default"}>{STATUS_LABEL[invoice.status]}</Badge>
          </div>
          <p className="truncate text-sm text-muted-foreground">{invoice.client_name} · {invoice.issue_date.split("-").reverse().join("/")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 font-semibold text-success">{eur(invoice.amount)}</span>
          <Select
            value={invoice.status}
            onValueChange={(v) => startTransition(async () => { const r = await updateInvoiceStatus(invoice.id, v as InvoiceStatus); if (!r.ok) toast("Mise à jour impossible.", "error"); })}
            disabled={pending}
          >
            <SelectTrigger className="h-9 w-[120px]" aria-label="Statut"><SelectValue /></SelectTrigger>
            <SelectContent>
              {/* Le statut ne recule pas : seuls l'état actuel et les suivants sont proposés. */}
              {STATUS_ORDER.slice(STATUS_ORDER.indexOf(invoice.status)).map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button asChild variant="outline" size="icon" aria-label="Télécharger le PDF">
            <a href={`/api/invoices/${invoice.id}/pdf`}><Download className="h-4 w-4" /></a>
          </Button>
          <SendDialog invoice={invoice} />
          {/* Une facture numérotée ne se supprime pas ; seuls les devis le peuvent. */}
          {invoice.document_type === "devis" && (
            <Button
              variant="ghost" size="icon" aria-label="Supprimer le devis" disabled={pending}
              onClick={() => { if (confirm("Supprimer ce devis ?")) startTransition(async () => { const r = await deleteInvoice(invoice.id); if (!r.ok) toast("Suppression impossible.", "error"); }); }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function InvoiceManager({ invoices, issuer }: { invoices: Invoice[]; issuer: Issuer }) {
  return (
    <div className="space-y-4">
      <NewInvoiceDialog issuer={issuer} />
      {invoices.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">Aucun document pour le moment.</p>
      ) : (
        <div className="space-y-3">{invoices.map((i) => <InvoiceRow key={i.id} invoice={i} />)}</div>
      )}
    </div>
  );
}
