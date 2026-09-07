"use client";

import { useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { PopularProjects } from "@/components/site/PopularProjects";
import { HowItWorks } from "@/components/site/HowItWorks";
import { TrustSection } from "@/components/site/TrustSection";
import { AccessibilitySection } from "@/components/site/AccessibilitySection";
import { TestimonialSection } from "@/components/site/TestimonialSection";
import { ProSection } from "@/components/site/ProSection";
import { CTASection } from "@/components/site/CTASection";
import { Footer } from "@/components/site/Footer";

/**
 * Landing page.
 *
 * Section order follows the customer's actual question order: what do I need
 * (hero search) → what can you do (categories, popular jobs) → how does this
 * work → why should I trust you (trust, accessibility, social proof) → what
 * about my side of the market (tradespeople) → act (waitlist).
 */
export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Header />

      <main id="main">
        <Hero />
        <CategoryGrid />
        <PopularProjects />
        <HowItWorks />
        <TrustSection />
        <AccessibilitySection />
        <TestimonialSection />
        <ProSection />
        <CTASection />
      </main>

      <Footer />
    </MotionConfig>
  );
}

/** Thin reading-position bar. Decorative, so it is hidden from assistive tech. */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="scroll-progress"
      aria-hidden="true"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
