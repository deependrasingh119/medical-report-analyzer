import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareLens — Make sense of your report",
  description:
    "A synthetic-data demo for preparing conversations with your care team. No real reports are processed or saved.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
