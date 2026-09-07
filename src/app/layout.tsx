import type { Metadata } from "next";
import { Jost, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/*
 * Self-hosted via next/font so every visitor sees the same typeface.
 * Previously the display stack asked for Futura/Avenir Next, which exist on
 * macOS but not Windows — Windows silently fell back to Century Gothic, so
 * the brand looked different (and dated) depending on the visitor's OS.
 *
 * Jost is an open-source geometric sans in the Futura lineage, so it keeps
 * the intended Craft Premium character while actually being guaranteed to load.
 */
const jost = Jost({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-loaded",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-body-loaded",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Passionate Taskers — Tell us what needs fixing",
  description:
    "Describe the job in your own words, by voice or text. We turn it into a proper job post and match you with verified, insured tradespeople near you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
         * Applies the saved display preferences before first paint. Without
         * this, a visitor who needs light mode or larger text gets a flash of
         * the dark, small-text default on every page load — which is worst for
         * exactly the people the preference exists to help.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=document.documentElement;var m=localStorage.getItem('pt-mode');var t=localStorage.getItem('pt-text');r.setAttribute('data-mode',m==='light'?'light':'dark');r.setAttribute('data-text',t==='lg'?'lg':'normal');}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
