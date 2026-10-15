"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { track } from "@/lib/analytics";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { CATEGORIES, EQUIPMENT, formatRate, recommend, type Option } from "@/lib/activities";
import { PLATFORMS } from "@/lib/platforms";
import { saveOnboarding } from "@/app/actions/onboarding";

const STEPS = ["Compétences", "Matériel", "Disponibilité"] as const;
const HOURS = [2, 5, 8, 12, 20];

function Chips({ options, selected, onToggle }: { options: Option[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => {
        const on = selected.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(o.id)}
            className={cn(
              "flex min-h-[48px] items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition-colors",
              on ? "border-primary bg-accent font-medium" : "bg-card hover:bg-accent/50",
            )}
          >
            {o.label}
            {on && <Check className="h-4 w-4 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}

const PENDING_KEY = "compleo:pending-diagnostic";

interface Answers { categories: string[]; equipment: string[]; weeklyHours: number }

const readPending = (): Answers | null => {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as Answers) : null;
  } catch {
    return null;
  }
};
const writePending = (a: Answers | null) => {
  try {
    if (a) window.localStorage.setItem(PENDING_KEY, JSON.stringify(a));
    else window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* stockage indisponible : on ignore */
  }
};

export function OnboardingWizard({ signedIn }: { signedIn: boolean }) {
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [hours, setHours] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const started = useRef(false);

  // Entonnoir : « diagnostic commencé » est envoyé une seule fois, à la première interaction.
  const markStarted = () => {
    if (started.current) return;
    started.current = true;
    track("diagnostic_started");
  };

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) => {
    markStarted();
    setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const canNext = step === 0 ? categories.length > 0 : step === 1 ? true : hours !== null;
  const results = useMemo(
    () => (done && hours ? recommend({ categories, equipment, weeklyHours: hours }) : []),
    [done, categories, equipment, hours],
  );

  // Après inscription : les réponses faites avant la connexion sont enregistrées automatiquement.
  useEffect(() => {
    if (!signedIn) return;
    const pending = readPending();
    if (!pending || !Array.isArray(pending.categories) || !Array.isArray(pending.equipment)) return;
    saveOnboarding(pending).then((res) => {
      if (!res.ok) return;
      writePending(null);
      setCategories(pending.categories);
      setEquipment(pending.equipment);
      setHours(pending.weeklyHours);
      setDone(true);
    });
  }, [signedIn]);

  function finish() {
    if (hours === null) return;
    if (!signedIn) {
      // Les recommandations s'affichent avant toute demande d'inscription.
      writePending({ categories, equipment, weeklyHours: hours });
      track("diagnostic_completed");
      setDone(true);
      return;
    }
    startTransition(async () => {
      const res = await saveOnboarding({ categories, equipment, weeklyHours: hours });
      if (!res.ok) toast(res.error ?? "Enregistrement impossible.", "error");
      else {
        track("diagnostic_completed");
        setDone(true);
      }
    });
  }

  if (done) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Vos 3 activités recommandées</h1>
          <p className="text-muted-foreground">Estimations basées sur {hours} h/semaine, dont 60 % réellement facturées.</p>
        </div>
        {results.map(({ activity, monthlyMin, monthlyMax, missingEquipment }, i) => (
          <Card key={activity.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge>#{i + 1}</Badge>
                {missingEquipment.length > 0 && <Badge variant="warning">Matériel à prévoir</Badge>}
              </div>
              <CardTitle>{activity.title}</CardTitle>
              <CardDescription>{activity.pitch}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><span className="text-muted-foreground">Tarif moyen en France :</span> <strong>{formatRate(activity)}</strong></p>
              <p className="font-semibold text-success">≈ {monthlyMin} € à {monthlyMax} € / mois</p>
              <p>
                <span className="text-muted-foreground">Où trouver des clients :</span>{" "}
                {activity.platforms.map((p) => PLATFORMS[p].label).join(", ")}
              </p>
              {missingEquipment.length > 0 && (
                <p className="text-amber-700">
                  Il vous faudrait : {missingEquipment.map((id) => EQUIPMENT.find((e) => e.id === id)?.label).join(" ou ")}.
                </p>
              )}
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/listings?service=${encodeURIComponent(activity.title)}`}>Rédiger mon annonce</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {signedIn ? (
          <Button asChild size="lg" className="w-full"><Link href="/dashboard">Aller au tableau de bord</Link></Button>
        ) : (
          <div className="space-y-2 rounded-lg border border-primary/40 p-4">
            <p className="font-semibold">Enregistrez vos résultats</p>
            <p className="text-sm text-muted-foreground">
              Créez un compte gratuit pour conserver ce diagnostic, rédiger vos annonces et simuler votre net.
            </p>
            <Button asChild size="lg" className="w-full"><Link href="/login?next=/onboarding">Créer un compte gratuit</Link></Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">Estimations selon profil et temps disponible, sans garantie de revenu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Étape {step + 1} sur {STEPS.length} · {STEPS[step]}</p>
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </div>

      <Card>
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle>Qu'aimez-vous faire ?</CardTitle>
              <CardDescription>Sélectionnez un ou plusieurs domaines.</CardDescription>
            </CardHeader>
            <CardContent><Chips options={CATEGORIES} selected={categories} onToggle={toggle(setCategories)} /></CardContent>
          </>
        )}
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>De quel matériel disposez-vous ?</CardTitle>
              <CardDescription>Vous pouvez ne rien sélectionner : certaines activités n'en demandent pas.</CardDescription>
            </CardHeader>
            <CardContent><Chips options={EQUIPMENT} selected={equipment} onToggle={toggle(setEquipment)} /></CardContent>
          </>
        )}
        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Combien de temps par semaine ?</CardTitle>
              <CardDescription>Le temps que vous pouvez consacrer à cette activité.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    aria-pressed={hours === h}
                    onClick={() => {
                      markStarted();
                      setHours(h);
                    }}
                    className={cn(
                      "min-h-[48px] rounded-md border px-3 py-3 text-sm transition-colors",
                      hours === h ? "border-primary bg-accent font-medium" : "bg-card hover:bg-accent/50",
                    )}
                  >
                    {h === 20 ? "20 h et +" : `${h} h`}
                  </button>
                ))}
              </div>
            </CardContent>
          </>
        )}
      </Card>

      <div className="flex justify-between gap-3">
        <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || pending}>
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>Suivant <ArrowRight className="h-4 w-4" /></Button>
        ) : (
          <Button variant="success" onClick={finish} disabled={!canNext || pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Voir mes activités
          </Button>
        )}
      </div>
    </div>
  );
}
