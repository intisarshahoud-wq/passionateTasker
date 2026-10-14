import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { FAQS } from "@/data/faqs";
import { AccessibilitySection } from "@/features/landing/AccessibilitySection";
import { CTASection } from "@/features/landing/CTASection";
import { FaqSection } from "@/features/landing/FaqSection";
import { Hero } from "@/features/landing/Hero";
import { HowItWorks } from "@/features/landing/HowItWorks";
import { MilestonesSection } from "@/features/landing/MilestonesSection";
import { PaymentsSection } from "@/features/landing/PaymentsSection";
import { PopularProjects } from "@/features/landing/PopularProjects";
import { ProSection } from "@/features/landing/ProSection";
import { TestimonialSection } from "@/features/landing/TestimonialSection";
import { TrustSection } from "@/features/landing/TrustSection";
import { ServiceExplorer } from "@/features/services/ServiceExplorer";
import { HOME_TITLE, faqNode, jsonLd, organizationNode, pageMetadata, websiteNode } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: HOME_TITLE,
  brandInTitle: false,
  description: SITE.description,
  path: "/",
});

/**
 * Landing page.
 *
 * Section order follows the customer's actual question order: what do I need
 * (hero search), how does this work (the five steps), what can you do
 * (services, popular jobs), why should I trust you (checks, accessibility,
 * social proof), what about bigger jobs and money (stages, paying), what about
 * my side of the market (tradespeople), what am I still unsure about (the
 * questions), then act (waitlist).
 *
 * A server component. It only puts sections in order; the header, footer and
 * assistant come from `(marketing)/layout.tsx`.
 */
export default function Home() {
  return (
    <>
      {/* Who we are, what the site is, and the questions below, for search
          engines and AI systems. It says nothing the page does not show. */}
      <JsonLd data={jsonLd(organizationNode(), websiteNode(), faqNode(FAQS))} />

      <Hero />
      <HowItWorks />
      <ServiceExplorer />
      <PopularProjects />
      <TrustSection />
      <AccessibilitySection />
      <TestimonialSection />
      <MilestonesSection />
      <PaymentsSection />
      <ProSection />
      <FaqSection />
      <CTASection />
    </>
  );
}
