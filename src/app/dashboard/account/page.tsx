import { requireUser } from "@/lib/auth";
import { AccountActions } from "@/components/account/account-actions";

export const metadata = { title: "Mon compte | Compléo" };

export default async function AccountPage() {
  const { user, profile } = await requireUser();
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon compte</h1>
        <p className="text-muted-foreground">Exportez ou supprimez vos données personnelles.</p>
      </div>
      <AccountActions email={user.email ?? ""} emailTips={profile.email_tips_optin} />
    </div>
  );
}
