import { requireUser } from "@/lib/auth";
import { InvoiceManager } from "@/components/invoices/invoice-manager";
import type { Invoice } from "@/types/database";

export const metadata = { title: "Factures · Compléo" };

export default async function InvoicesPage() {
  const { supabase, user, profile } = await requireUser();
  const { data } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("issue_date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<Invoice[]>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Devis et factures</h1>
        <p className="text-muted-foreground">Documents sans TVA pour micro-entrepreneur, téléchargeables en PDF.</p>
      </div>
      <InvoiceManager
        invoices={data ?? []}
        issuer={{ name: profile.full_name ?? "", siret: profile.siret ?? "", address: profile.address ?? "" }}
      />
    </div>
  );
}
