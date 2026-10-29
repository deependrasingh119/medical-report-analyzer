import { AppShell } from "@/components/app-shell";
import { ClinicianDashboard } from "@/components/clinician-dashboard";

export default function CliniciansPage() {
  return (
    <AppShell activeView="clinicians">
      <ClinicianDashboard />
    </AppShell>
  );
}
