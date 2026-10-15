import { pageMetadata, NOINDEX } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard, type ActivityPhotos } from "@/components/onboarding/wizard";
import { ACTIVITIES } from "@/lib/activities";
import { activityPhoto } from "@/lib/site-images";

/** Photos disponibles, par id d'activité : seules celles qui existent sont envoyées au navigateur. */
const PHOTOS: ActivityPhotos = Object.fromEntries(
  ACTIVITIES.flatMap((a) => {
    const photo = activityPhoto(a.id);
    return photo ? [[a.id, photo]] : [];
  }),
);

export const metadata = { title: "Diagnostic d'activité | Compléo", ...NOINDEX };

export default async function OnboardingPage() {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  return (
    <main className="container max-w-2xl py-8">
      <OnboardingWizard signedIn={Boolean(user)} photos={PHOTOS} />
    </main>
  );
}
