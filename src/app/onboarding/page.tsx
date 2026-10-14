import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/wizard";

export const metadata = { title: "Diagnostic · Compléo" };

export default async function OnboardingPage() {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  return (
    <main className="container max-w-2xl py-8">
      <OnboardingWizard signedIn={Boolean(user)} />
    </main>
  );
}
