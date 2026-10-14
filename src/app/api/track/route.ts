import { NextResponse } from "next/server";
import { CLIENT_EVENTS, type ClientEvent } from "@/lib/analytics";
import { recordEvent } from "@/lib/analytics-server";

export const runtime = "nodejs";

/** Reçoit uniquement les événements navigateur ; les événements de paiement et de compte restent côté serveur. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { name?: unknown; path?: unknown; props?: unknown } | null;
  const name = body?.name;
  if (typeof name !== "string" || !(CLIENT_EVENTS as readonly string[]).includes(name)) {
    return NextResponse.json({ error: "Événement inconnu." }, { status: 400 });
  }
  const path = typeof body?.path === "string" && /^\/[\w\-./]{0,199}$/.test(body.path) ? body.path : null;
  await recordEvent(name as ClientEvent, body?.props, path);
  return new NextResponse(null, { status: 204 });
}
