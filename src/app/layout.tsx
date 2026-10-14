import type { Metadata } from "next";
import { Jost, Geist, Geist_Mono } from "next/font/google";
import { HOME_TITLE, SITE_URL } from "@/lib/seo";
import { SITE } from "@/lib/site";
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

/*
 * Defaults for every page. A page sets its own title, description and
 * canonical address with pageMetadata() in lib/seo.ts; the template below adds
 * the brand after the page's title. metadataBase is what turns a path such as
 * "/trust" into a full address in canonical links and share cards.
 *
 * No canonical address here on purpose: a page that forgot to set its own
 * would inherit this one and tell search engines it is the home page.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    siteName: SITE.name,
    locale: "en_GB",
    type: "website",
  },
};

/*
 * Applies the saved display preferences before first paint. Without this, a
 * visitor who needs light mode, larger text or high contrast gets a flash of
 * the dark, small-text default on every page load — which is worst for exactly
 * the people the preferences exist to help.
 *
 * Contrast follows the device when the visitor has not chosen here: someone
 * whose system asks for more contrast gets the high-contrast theme without
 * having to find the button. The same logic is in lib/display-prefs.ts; keep
 * the two in step.
 */
const DISPLAY_PREFS_SCRIPT = `(function(){var r=document.documentElement,m=null,t=null,c=null;try{m=localStorage.getItem('pt-mode');t=localStorage.getItem('pt-text');c=localStorage.getItem('pt-contrast');}catch(e){}if(c!=='high'&&c!=='normal'){try{c=window.matchMedia('(prefers-contrast: more)').matches?'high':'normal';}catch(e){c='normal';}}r.setAttribute('data-mode',m==='light'?'light':'dark');r.setAttribute('data-text',t==='lg'?'lg':'normal');r.setAttribute('data-contrast',c);})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={SITE.lang}
      className={`${jost.variable} ${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: DISPLAY_PREFS_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
