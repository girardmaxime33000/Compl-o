import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { SimulationPdf } from "@/components/simulator/simulation-pdf";
import { simulate } from "@/lib/tax";

export const runtime = "nodejs";

const bodySchema = z.object({
  monthlyRevenue: z.number().finite().min(0).max(1_000_000),
  regime: z.enum(["bnc", "bic"]),
  unemployment: z
    .object({
      enabled: z.boolean(),
      monthlyAre: z.number().finite().min(0).max(100_000),
      referenceSalary: z.number().finite().min(0).max(1_000_000),
    })
    .optional(),
});

/** Export PDF d'une simulation, réservé aux comptes. Le résultat est recalculé côté serveur. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise.", code: "AUTH_REQUIRED" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });

  const result = simulate(parsed.data);
  const buffer = await renderToBuffer(SimulationPdf({ result, regime: parsed.data.regime }));
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="simulation-compleo-${new Date().toISOString().slice(0, 10)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
