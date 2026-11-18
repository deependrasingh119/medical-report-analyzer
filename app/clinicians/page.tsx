import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ClinicianDashboard } from "@/components/clinician-dashboard";

export default function CliniciansPage() {
  return (
    <AppShell activeView="clinicians">
      <p className="local-ocr-entry-link">
        <Link href="/clinicians/extract">
          Try local OCR with a synthetic PDF
        </Link>
      </p>
      <ClinicianDashboard />
    </AppShell>
  );
}
