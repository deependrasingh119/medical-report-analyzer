import {
  ArrowRight,
  BookOpenText,
  LockKeyhole,
  MessageCircleQuestion,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <AppShell activeView="overview">
      <section className="welcome-row" aria-labelledby="welcome-title">
        <div>
          <p className="eyebrow">YOUR HEALTH, MADE CLEARER</p>
          <h1 id="welcome-title">
            Understand your report.
            <br />
            <span>Prepare for what’s next.</span>
          </h1>
          <p className="welcome-copy">
            A little more clarity can help you have a confident conversation
            with your care team.
          </p>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-sun" />
          <div className="art-paper">
            <i />
            <i />
            <i />
            <b />
          </div>
          <div className="art-sparkle">✳</div>
        </div>
      </section>

      <aside className="safety-banner" role="note" aria-label="Important demo notice">
        <span className="safety-icon" aria-hidden="true">
          i
        </span>
        <p>
          <strong>Synthetic demo only — not medical advice.</strong> This
          foundation does not process report files or provide diagnosis, triage,
          or treatment recommendations. A qualified clinician must review
          health information and guide care.
        </p>
      </aside>

      <section aria-labelledby="report-preparation-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">GET STARTED</p>
            <h2 id="report-preparation-title">Bring a report into focus</h2>
          </div>
          <span className="step-count">01 — 02</span>
        </div>

        <div className="foundation-card">
          <div className="foundation-card-heading">
            <span className="upload-symbol" aria-hidden="true">
              <BookOpenText size={22} />
            </span>
            <div>
              <h3>Prepare for a clinician conversation</h3>
              <p>Organize context and questions for a future visit.</p>
            </div>
          </div>
          <p>
            Explore one fixed synthetic example and prepare clinician questions.
            This demo cannot accept, open, or process report files; never enter
            real health information.
          </p>
          <p className="foundation-note">
            <LockKeyhole aria-hidden="true" size={17} />
            No report file is opened, uploaded, persisted, or sent to a service.
          </p>
          <div className="mt-5">
            <Button asChild>
              <Link href="/reports">
                Explore the demo workspace <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="next-steps" aria-labelledby="steps-title">
        <div className="steps-intro">
          <p className="eyebrow">A GENTLER WAY TO GET READY</p>
          <h2 id="steps-title">Small steps, more clarity</h2>
        </div>
        <article className="step-card">
          <span className="step-number">1</span>
          <div>
            <strong>Understand the language</strong>
            <p>Get familiar with medical terms, one at a time.</p>
          </div>
        </article>
        <article className="step-card">
          <span className="step-number">2</span>
          <div>
            <strong>Make a question list</strong>
            <p>Bring the things you’re wondering about to your visit.</p>
          </div>
          <MessageCircleQuestion
            className="text-green-dark"
            size={18}
            aria-hidden="true"
          />
        </article>
      </section>

      <footer className="page-footer">
        <span>
          CareLens is an informational demo, not a substitute for professional
          medical care.
        </span>
        <Link href="/clinicians">Clinician review boundaries</Link>
      </footer>
    </AppShell>
  );
}
