import Link from "next/link";
import {
  FileText,
  HeartPulse,
  Home,
  LockKeyhole,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

export type CareLensView = "overview" | "reports" | "clinicians";

type AppShellProps = {
  activeView: CareLensView;
  children: ReactNode;
};

const navigation: Array<{
  href: string;
  label: string;
  view: CareLensView;
  Icon: LucideIcon;
}> = [
  { href: "/", label: "Overview", view: "overview", Icon: Home },
  {
    href: "/reports",
    label: "Prepare for visit",
    view: "reports",
    Icon: FileText,
  },
  {
    href: "/clinicians",
    label: "For clinicians",
    view: "clinicians",
    Icon: HeartPulse,
  },
];

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M16 5.5v21M5.5 16h21"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3.5"
        />
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" />
      </svg>
    </span>
  );
}

export function AppShell({ activeView, children }: AppShellProps) {
  const activeLabel =
    navigation.find((item) => item.view === activeView)?.label ?? "Overview";

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <aside className="app-sidebar" aria-label="CareLens workspace">
        <Link className="brand" href="/" aria-label="CareLens home">
          <BrandMark />
          <span>
            care<span className="brand-light">lens</span>
          </span>
        </Link>

        <p className="nav-label">WORKSPACE</p>
        <nav className="nav-links" aria-label="Main navigation">
          {navigation.map(({ href, label, view, Icon }) => (
            <Link
              key={view}
              className="nav-link"
              href={href}
              aria-current={activeView === view ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <section className="privacy-card" aria-label="Demo safety boundary">
            <LockKeyhole className="privacy-icon" size={18} aria-hidden="true" />
            <strong>Synthetic demo only</strong>
            <p>
              No real reports are accepted, opened, saved, or shared in this
              demo.
            </p>
          </section>
          <div className="profile-preview" aria-label="Demo workspace, no sign-in">
            <span aria-hidden="true">◉</span>
            <span>Demo workspace · no sign-in</span>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="breadcrumbs" aria-label="Breadcrumb">
            <span>Workspace</span>
            <span aria-hidden="true">/</span>
            <strong aria-current="page">{activeLabel}</strong>
          </div>
          <span className="demo-pill">Synthetic demo</span>
        </header>

        <main className="content-wrap" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
