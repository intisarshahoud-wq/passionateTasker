"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JOURNEY } from "@/data/how-it-works";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The five-step promise — tell us, match, talk, track, approve — revealed one
 * step at a time while the section is pinned.
 *
 * The pin runs only where all five steps sit in one row on a screen tall
 * enough to hold the whole section, and only with motion allowed: pinning is
 * expensive on mobile, clips the section on a short screen, and is actively
 * disorienting for anyone who asked for reduced motion. gsap.matchMedia scopes
 * it and cleans it up automatically. Outside those conditions the steps are
 * simply always visible — the content never depends on the animation running.
 */
export function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1100px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)",
        () => {
          const steps = gsap.utils.toArray<HTMLElement>(".step", root.current);
          if (!steps.length) return;

          gsap.set(steps, { opacity: 0.22, scale: 0.96 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top 88px",
              end: () => "+=" + window.innerHeight * 1.6,
              scrub: 0.6,
              pin: true,
            },
          });

          steps.forEach((step, i) => {
            tl.to(step, { opacity: 1, scale: 1, duration: 1, ease: "none" }, i === 0 ? 0 : "+=0.3");
          });

          // Fonts and images settle after the first measurement pass, which
          // otherwise leaves the pin boundaries (and any #how deep link) offset.
          const refresh = () => ScrollTrigger.refresh();
          document.fonts?.ready?.then(refresh);
          window.addEventListener("load", refresh);
          return () => window.removeEventListener("load", refresh);
        }
      );
    },
    { scope: root }
  );

  return (
    <section id="how" ref={root}>
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">How it works</span>
          <h2>Five steps, start to finish</h2>
          <p>No account to create before you are even allowed to ask for help.</p>
        </div>

        <ol className="steps">
          {JOURNEY.map((step) => (
            <li className="step" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.summary}</p>
            </li>
          ))}
        </ol>

        <p className="section-more">
          <Link className="text-link" href="/how-it-works">
            See each step in full, and how paying works
          </Link>
        </p>
      </div>
    </section>
  );
}
