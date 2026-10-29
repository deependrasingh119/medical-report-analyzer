import { AppShell } from "@/components/app-shell";
import { PatientPreparation } from "@/components/patient-preparation";

export default function ReportsPage() {
  return (
    <AppShell activeView="reports">
      <PatientPreparation />
    </AppShell>
  );
}
