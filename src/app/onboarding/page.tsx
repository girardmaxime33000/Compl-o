import { requireUser } from "@/lib/auth";
import { OnboardingWizard } from "@/components/onboarding/wizard";

export const metadata = { title: "Diagnostic · JobBoost FR" };

export default async function OnboardingPage() {
  await requireUser();
  return (
    <main className="container max-w-2xl py-8">
      <OnboardingWizard />
    </main>
  );
}
