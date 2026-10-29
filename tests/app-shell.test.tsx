import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "../components/app-shell";
import { Button } from "../components/ui/button";

describe("CareLens frontend foundation", () => {
  it("provides accessible primary navigation and an explicit synthetic-data boundary", () => {
    render(
      <AppShell activeView="overview">
        <h1>Overview</h1>
      </AppShell>,
    );

    expect(
      screen.getByRole("navigation", { name: "Main navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByText("Synthetic demo only")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Overview" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("marks the current view without marking other navigation links current", () => {
    render(
      <AppShell activeView="reports">
        <h1>Prepare for visit</h1>
      </AppShell>,
    );

    expect(screen.getByRole("link", { name: "Prepare for visit" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders a semantic button with the shadcn-style default variant", () => {
    render(<Button>Continue</Button>);

    expect(screen.getByRole("button", { name: "Continue" })).toHaveClass(
      "bg-green",
    );
  });
});
