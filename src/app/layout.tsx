import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Passionate Taskers — Just tell us what's wrong",
  description:
    "The AI-powered, voice-first way to find a verified, insured tradesperson.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
