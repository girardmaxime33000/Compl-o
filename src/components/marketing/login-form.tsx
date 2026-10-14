"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next, initialError }: { next: string; initialError?: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(initialError ? "La connexion a échoué. Réessayez." : null);

  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    });
    setLoading(false);
    if (error) setError("Impossible d'envoyer le lien. Vérifiez votre adresse e-mail.");
    else setSent(true);
  }

  async function signInWithGoogle() {
    setError(null);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) setError("Connexion Google indisponible.");
  }

  if (sent) {
    return (
      <div className="rounded-md bg-accent p-4 text-sm">
        <p className="font-medium">Lien envoyé à {email}</p>
        <p className="mt-1 text-muted-foreground">Ouvrez l'e-mail reçu et cliquez sur le lien pour vous connecter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={sendMagicLink} className="space-y-3">
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input id="email" type="email" required autoComplete="email" placeholder="vous@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Recevoir un lien de connexion
        </Button>
      </form>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={signInWithGoogle}>
        Continuer avec Google
      </Button>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}
