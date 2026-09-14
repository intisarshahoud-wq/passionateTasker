import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { AssistantChat } from "@/features/assistant/AssistantChat";

/**
 * The shell shared by every public page: the landing page now, and the
 * service and category pages next.
 *
 * The brackets in `(marketing)` make this a route group. It groups pages under
 * one layout without appearing in the URL, so the landing page is still `/`.
 * Signed-in screens (dashboards, messages) will get their own `(app)` group
 * with a different shell, and the light theme by default.
 *
 * A server component: it only arranges things. Each piece that needs the
 * browser (the header menu, the assistant) is a client component on its own.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <ScrollProgress />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Header />

      <main id="main">{children}</main>

      <Footer />

      {/* Last in the DOM so it is the final tab stop, but reachable from
          anywhere on the page — the way out for anyone who cannot find the
          section that holds their answer. */}
      <AssistantChat />
    </MotionProvider>
  );
}
