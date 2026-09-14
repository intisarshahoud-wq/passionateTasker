"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HOW_IT_WORKS } from "@/data/marketplace";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The three-step promise, revealed one step at a time while the section is
 * pinned.
 *
 * The pin runs only on wide screens with motion allowed: pinning is expensive
 * on mobile and actively disorienting for anyone who asked for reduced motion,
 * so gsap.matchMedia scopes it and cleans it up automatically. Outside those
 * conditions the steps are simply always visible — the content never depends on
 * the animation running.
 */
export function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 860px) and (prefers-reduced-motion: no-preference)", () => {
        const steps = gsap.utils.toArray<HTMLElement>(".step", root.current);
        if (!steps.length) return;

        gsap.set(steps, { opacity: 0.22, scale: 0.96 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 88px",
            end: () => "+=" + window.innerHeight * 1.4,
            scrub: 0.6,
            pin: true,
          },
        });

        steps.forEach((step, i) => {
          tl.to(step, { opacity: 1, scale: 1, duration: 1, ease: "none" }, i === 0 ? 0 : "+=0.4");
        });

        // Fonts and images settle after the first measurement pass, which
        // otherwise leaves the pin boundaries (and any #how deep link) offset.
        const refresh = () => ScrollTrigger.refresh();
        document.fonts?.ready?.then(refresh);
        window.addEventListener("load", refresh);
        return () => window.removeEventListener("load", refresh);
      });
    },
    { scope: root }
  );

  return (
    <section id="how" ref={root}>
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">How it works</span>
          <h2>Three steps, start to finish</h2>
          <p>No account to create before you are even allowed to ask for help.</p>
        </div>

        <ol className="steps">
          {HOW_IT_WORKS.map((step) => (
            <li className="step" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
