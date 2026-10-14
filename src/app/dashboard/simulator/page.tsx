import { requireUser } from "@/lib/auth";
import { Simulator } from "@/components/simulator/simulator";

export const metadata = { title: "Simulateur · JobBoost FR" };

export default async function SimulatorPage() {
  await requireUser();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Net dans la poche</h1>
        <p className="text-muted-foreground">Estimez ce qu'il vous reste après cotisations URSSAF (micro-entreprise).</p>
      </div>
      <Simulator />
    </div>
  );
}
