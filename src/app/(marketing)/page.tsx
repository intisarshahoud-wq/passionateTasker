import { AccessibilitySection } from "@/features/landing/AccessibilitySection";
import { CTASection } from "@/features/landing/CTASection";
import { Hero } from "@/features/landing/Hero";
import { HowItWorks } from "@/features/landing/HowItWorks";
import { PopularProjects } from "@/features/landing/PopularProjects";
import { ProSection } from "@/features/landing/ProSection";
import { TestimonialSection } from "@/features/landing/TestimonialSection";
import { TrustSection } from "@/features/landing/TrustSection";
import { ServiceExplorer } from "@/features/services/ServiceExplorer";

/**
 * Landing page.
 *
 * Section order follows the customer's actual question order: what do I need
 * (hero search), what can you do (categories, popular jobs), how does this
 * work, why should I trust you (trust, accessibility, social proof), what about
 * my side of the market (tradespeople), then act (waitlist).
 *
 * A server component. It only puts sections in order; the header, footer and
 * assistant come from `(marketing)/layout.tsx`.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <ServiceExplorer />
      <PopularProjects />
      <HowItWorks />
      <TrustSection />
      <AccessibilitySection />
      <TestimonialSection />
      <ProSection />
      <CTASection />
    </>
  );
}
