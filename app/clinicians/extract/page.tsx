import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { LocalOcrExtraction } from "@/components/local-ocr-extraction";

export default function ClinicianExtractionPage() {
  return (
    <AppShell activeView="clinicians">
      <p className="local-ocr-back-link">
        <Link href="/clinicians">← Back to clinician demo</Link>
      </p>
      <LocalOcrExtraction />
    </AppShell>
  );
}
