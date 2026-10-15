import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Sonde de disponibilité pour la supervision (UptimeRobot, Better Stack...). Ne touche ni la base ni un service externe :
 * elle prouve seulement que l'application répond. Pas de donnée sensible ; le commit sert à vérifier quel déploiement répond.
 */
export function GET() {
  return NextResponse.json(
    { status: "ok", commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null, env: process.env.VERCEL_ENV || "local" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
