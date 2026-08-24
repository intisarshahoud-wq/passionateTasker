"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LogoMark } from "@/components/LogoMark";
import { Magnetic } from "@/components/Magnetic";
import CursorGrid from "@/components/reactbits/CursorGrid";
import { HeroVideo } from "@/components/HeroVideo";

gsap.registerPlugin(ScrollTrigger);

const easeOut = [0.22, 1, 0.36, 1] as const;

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

const headlineContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.1 } },
};
const headlineWord = {
  hidden: { opacity: 0, y: 6, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: easeOut },
  },
};
const HEADLINE_LINE_1 = ["Just", "tell", "us", "what's", "wrong."];
const HEADLINE_LINE_2 = ["We'll", "find", "who", "can", "fix", "it."];

const revealUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};
const staggerGrid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const iconDraw = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeInOut" as const, delay: 0.15 },
  },
};

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const howRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>(".step", howRef.current);
      if (!steps.length) return;

      gsap.set(steps, { opacity: 0.22, scale: 0.96 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: howRef.current,
          start: "top 72px",
          end: () => "+=" + window.innerHeight * 1.5,
          scrub: 0.6,
          pin: true,
        },
      });

      steps.forEach((step, i) => {
        tl.to(
          step,
          { opacity: 1, scale: 1, duration: 1, ease: "none" },
          i === 0 ? 0 : "+=0.4"
        );
      });

      // Recalculate trigger boundaries once fonts/layout have fully settled,
      // so a direct deep-link to #how (which the browser jumps to before
      // GSAP's pin spacer exists) doesn't leave scroll position desynced.
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready?.then(refresh);
      window.addEventListener("load", refresh);
      return () => window.removeEventListener("load", refresh);
    },
    { scope: howRef }
  );

  useEffect(() => {
    const root = document.documentElement;

    const textBtn = document.getElementById("textToggle") as HTMLButtonElement;
    const onTextToggle = () => {
      const on = root.getAttribute("data-text") === "lg";
      root.setAttribute("data-text", on ? "normal" : "lg");
      textBtn.setAttribute("aria-pressed", String(!on));
    };
    textBtn?.addEventListener("click", onTextToggle);

    const modeBtn = document.getElementById("modeToggle") as HTMLButtonElement;
    const modeLabel = document.getElementById("modeLabel") as HTMLSpanElement;
    const onModeToggle = () => {
      const isLight = root.getAttribute("data-mode") === "light";
      root.setAttribute("data-mode", isLight ? "dark" : "light");
      modeBtn.setAttribute("aria-pressed", String(!isLight));
      modeLabel.textContent = isLight ? "Light mode" : "Dark mode";
    };
    modeBtn?.addEventListener("click", onModeToggle);

    const roleCustomer = document.getElementById(
      "roleCustomer"
    ) as HTMLButtonElement;
    const roleTasker = document.getElementById(
      "roleTasker"
    ) as HTMLButtonElement;
    const roleToggle = document.querySelector(".role-toggle") as HTMLElement;
    function setRole(role: "customer" | "tasker") {
      const customerActive = role === "customer";
      roleCustomer.setAttribute("aria-pressed", String(customerActive));
      roleTasker.setAttribute("aria-pressed", String(!customerActive));
      roleToggle.setAttribute("data-active", customerActive ? "customer" : "tasker");
    }
    const onRoleCustomer = () => setRole("customer");
    const onRoleTasker = () => setRole("tasker");
    roleCustomer?.addEventListener("click", onRoleCustomer);
    roleTasker?.addEventListener("click", onRoleTasker);

    const roleLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("a[data-role]")
    );
    const onRoleLinkClicks = roleLinks.map((link) => {
      const handler = () =>
        setRole(link.getAttribute("data-role") === "pro" ? "tasker" : "customer");
      link.addEventListener("click", handler);
      return { link, handler };
    });

    const header = document.querySelector("header.site") as HTMLElement;
    const progressEl = document.getElementById("scrollProgress") as HTMLElement | null;
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 8);
      if (progressEl) {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const pct = scrollable > 0 ? window.scrollY / scrollable : 0;
        progressEl.style.transform = `scaleX(${pct})`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const statEl = document.getElementById("statCount") as HTMLElement | null;
    let statObserver: IntersectionObserver | null = null;
    if (statEl && "IntersectionObserver" in window) {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      let counted = false;
      statObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !counted) {
              counted = true;
              const target = parseInt(statEl.getAttribute("data-target") || "0", 10);
              if (reduceMotion) {
                statEl.textContent = String(target);
                return;
              }
              let start: number | null = null;
              const duration = 700;
              function step(ts: number) {
                if (start === null) start = ts;
                const progress = Math.min((ts - start) / duration, 1);
                statEl!.textContent = String(Math.round(progress * target));
                if (progress < 1) requestAnimationFrame(step);
              }
              requestAnimationFrame(step);
              statObserver?.disconnect();
            }
          });
        },
        { threshold: 0.6 }
      );
      statObserver.observe(statEl);
    }

    const previewCard = document.getElementById("heroMedia") as HTMLElement | null;
    const onMouseMove = (e: MouseEvent) => {
      if (!previewCard) return;
      const rect = previewCard.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (px - 0.5) * 10;
      const ry = (0.5 - py) * 10;
      previewCard.style.setProperty("--rx", `${rx}deg`);
      previewCard.style.setProperty("--ry", `${ry}deg`);
      previewCard.style.setProperty("--mx", `${px * 100}%`);
      previewCard.style.setProperty("--my", `${py * 100}%`);
    };
    const onMouseLeave = () => {
      if (!previewCard) return;
      previewCard.style.setProperty("--rx", "0deg");
      previewCard.style.setProperty("--ry", "0deg");
    };
    const wantsTilt =
      previewCard &&
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (wantsTilt) {
      previewCard.addEventListener("mousemove", onMouseMove);
      previewCard.addEventListener("mouseleave", onMouseLeave);
    }

    return () => {
      textBtn?.removeEventListener("click", onTextToggle);
      modeBtn?.removeEventListener("click", onModeToggle);
      roleCustomer?.removeEventListener("click", onRoleCustomer);
      roleTasker?.removeEventListener("click", onRoleTasker);
      onRoleLinkClicks.forEach(({ link, handler }) =>
        link.removeEventListener("click", handler)
      );
      window.removeEventListener("scroll", onScroll);
      statObserver?.disconnect();
      if (wantsTilt) {
        previewCard!.removeEventListener("mousemove", onMouseMove);
        previewCard!.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site">
        <div className="site-inner">
          <a className="logo" href="#top">
            <LogoMark />
            Passionate Taskers
          </a>
          <nav className="primary" aria-label="Primary">
            <a href="#how">How it works</a>
            <a href="#accessibility">Accessibility</a>
            <a href="#pros">For tradespeople</a>
          </nav>
          <div className="a11y-toggles" role="group" aria-label="Display preferences">
            <button className="a11y-btn" id="textToggle" type="button" aria-pressed="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 18L9 6h1l5 12M5.5 14h8" />
                <path d="M17 18l3-8 3 8M18.5 15.5h3" />
              </svg>
              Aa
            </button>
            <button className="a11y-btn" id="modeToggle" type="button" aria-pressed="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 000 18z" fill="currentColor" stroke="none" />
              </svg>
              <span id="modeLabel">Light mode</span>
            </button>
          </div>
          <Magnetic strength={8}>
            <a className="btn btn-primary btn-sm" href="#waitlist">
              Join waitlist
            </a>
          </Magnetic>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="ambient" aria-hidden="true">
            <span className="b1"></span>
            <span className="b2"></span>
            <span className="b3"></span>
          </div>
          <div className="wrap hero-grid">
            <motion.div variants={heroContainer} initial="hidden" animate="show">
              <motion.span className="eyebrow" variants={heroItem}>
                <span className="dot" aria-hidden="true"></span>
                Accessibility-first, from day one — now in early access
              </motion.span>
              <motion.h1 variants={headlineContainer}>
                {HEADLINE_LINE_1.map((word, i) => (
                  <motion.span
                    key={`l1-${i}`}
                    variants={headlineWord}
                    style={{ display: "inline-block" }}
                  >
                    {word}
                    {i < HEADLINE_LINE_1.length - 1 ? " " : ""}
                  </motion.span>
                ))}
                <br />
                {HEADLINE_LINE_2.map((word, i) => (
                  <motion.span
                    key={`l2-${i}`}
                    variants={headlineWord}
                    style={{ display: "inline-block" }}
                  >
                    {word}
                    {i < HEADLINE_LINE_2.length - 1 ? " " : ""}
                  </motion.span>
                ))}
              </motion.h1>
              <motion.p className="lede" variants={heroItem}>
                Passionate Taskers matches you with a verified, insured tradesperson by
                voice or by text — no long forms, no endless scrolling through profiles.
              </motion.p>
              <motion.div className="hero-ctas" variants={heroItem}>
                <Magnetic strength={10}>
                  <a className="btn btn-primary" href="#waitlist" data-role="customer">
                    I need something fixed
                  </a>
                </Magnetic>
                <a className="btn btn-outline" href="#waitlist" data-role="pro">
                  I&apos;m a tradesperson
                </a>
              </motion.div>
              <motion.p className="hero-note" variants={heroItem}>
                Free to join. We&apos;ll email you the moment early access opens in your
                area.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeOut }}
            >
              <HeroVideo />
            </motion.div>
          </div>
        </section>

        <section className="values wrap" aria-label="Why Passionate Taskers">
          <CursorGrid>
          <motion.div
            className="value-grid"
            variants={staggerGrid}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div className="value-card" variants={revealUp}>
              <span className="value-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <motion.rect variants={iconDraw} x="9" y="2" width="6" height="12" rx="3" />
                  <motion.path variants={iconDraw} d="M5 10a7 7 0 0014 0M12 17v4M9 21h6" />
                </svg>
              </span>
              <h3>Speak, don&apos;t fill out forms</h3>
              <p>Describe the job by voice or text — AI turns it into a clear, professional job post in seconds.</p>
            </motion.div>
            <motion.div className="value-card" variants={revealUp}>
              <span className="value-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <motion.path variants={iconDraw} d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                  <motion.path variants={iconDraw} d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <h3>Verified &amp; insured, always</h3>
              <p>Every tradesperson is checked before they can take a job — no exceptions.</p>
            </motion.div>
            <motion.div className="value-card" variants={revealUp}>
              <span className="value-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <motion.circle variants={iconDraw} cx="12" cy="12" r="9" />
                  <motion.path variants={iconDraw} d="M8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                </svg>
              </span>
              <h3>Built for everyone</h3>
              <p>Screen reader support, full keyboard navigation, and adjustable contrast and text size — built in, not bolted on.</p>
            </motion.div>
          </motion.div>
          </CursorGrid>
        </section>

        <section id="how" ref={howRef}>
          <div className="wrap">
            <div className="section-head">
              <span className="section-tag">How it works</span>
              <h2>Three steps, start to finish</h2>
              <p>No account forms to wade through before you can even ask for help.</p>
            </div>
            <div className="steps">
              <div className="step">
                <h3>Describe the job</h3>
                <p>Speak or type what needs fixing. Our AI turns it into a clear job post — category, priority, and details included.</p>
              </div>
              <div className="step">
                <h3>Get matched</h3>
                <p>We connect you with verified tradespeople nearby, ranked by rating, distance, and availability.</p>
              </div>
              <div className="step">
                <h3>Message &amp; book</h3>
                <p>Chat directly, agree a time, and get it done — all in one thread, no phone tag.</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Launch trades">
          <div className="wrap">
            <div className="section-head">
              <span className="section-tag">Launching with</span>
              <h2>The trades people ask for most</h2>
              <p>Starting focused, so every match is a good one. More trades joining as we grow.</p>
            </div>
            <CursorGrid>
            <motion.div
              className="trades-grid"
              variants={staggerGrid}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div className="trade-card" variants={revealUp}>
                <span className="value-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <motion.path variants={iconDraw} d="M12 3c3 4 5 6.5 5 9.5a5 5 0 01-10 0C7 9.5 9 7 12 3z" />
                  </svg>
                </span>
                <h3>Plumbers</h3>
                <p>Leaks, blockages, installations, emergency call-outs.</p>
              </motion.div>
              <motion.div className="trade-card" variants={revealUp}>
                <span className="value-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <motion.path variants={iconDraw} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
                  </svg>
                </span>
                <h3>Electricians</h3>
                <p>Rewiring, fault-finding, fittings, safety checks.</p>
              </motion.div>
              <motion.div className="trade-card" variants={revealUp}>
                <span className="value-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <motion.path variants={iconDraw} d="M14.5 6.5l3 3L7 20H4v-3z" />
                    <motion.path variants={iconDraw} d="M13 8l3-3 3 3-3 3" />
                  </svg>
                </span>
                <h3>Handymen</h3>
                <p>Repairs, assembly, and the jobs that don&apos;t fit one category.</p>
              </motion.div>
            </motion.div>
            </CursorGrid>
            <p className="mt-6 text-sm text-ink-faint">
              Not seeing your trade? Join the waitlist below and tell us — it directly shapes what we launch next.
            </p>
          </div>
        </section>

        <section id="accessibility">
          <div className="wrap">
            <div className="section-head">
              <span className="section-tag">Accessibility</span>
              <h2>Not a setting we added later</h2>
              <p>Checkatrade and TaskRabbit were both built for typing. We started from the assumption that not everyone can, or wants to.</p>
            </div>
            <motion.div
              className="a11y-panel"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={revealUp}
            >
              <ul className="a11y-list">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10a7 7 0 0014 0M12 17v4" />
                  </svg>
                  Full voice navigation, not just voice search
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M3 9h18M8 4v16" />
                  </svg>
                  Complete screen reader &amp; keyboard support
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
                  </svg>
                  One-tap high-contrast &amp; larger text — try it in the header now
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 12h16M4 6h16M4 18h10" />
                  </svg>
                  Simple, uncluttered layouts over feature-packed screens
                </li>
              </ul>
              <p className="a11y-cta">
                Notice the page just now? That&apos;s the same <strong>light &amp; large-text mode</strong> we&apos;ll ship in the product — one brand, two surfaces.
              </p>
            </motion.div>
          </div>
        </section>

        <section id="pros">
          <motion.div
            className="wrap pro-band"
            variants={staggerGrid}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={revealUp}>
              <span className="section-tag">For tradespeople</span>
              <h2>Spend less time chasing leads</h2>
              <ul>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  AI-qualified leads matched to your trade and area
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10a7 7 0 0014 0M12 17v4" />
                  </svg>
                  Respond by voice while you&apos;re on the job, hands full
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 4h16v16H4z" />
                    <path d="M8 9h8M8 13h5" />
                  </svg>
                  Build a real profile — reviews, response time, before &amp; after photos
                </li>
              </ul>
              <a className="btn btn-outline" href="#waitlist" data-role="pro">
                Join the tradesperson waitlist
              </a>
            </motion.div>
            <motion.div className="pro-stat-card" variants={revealUp}>
              <div className="big">Free</div>
              <div className="label">to join during early access — no subscription, no listing fee</div>
              <hr />
              <div className="big" id="statCount" data-target="3">
                0
              </div>
              <div className="label">trades launching first: plumbing, electrical, handyman</div>
            </motion.div>
          </motion.div>
        </section>

        <section id="waitlist">
          <div className="wrap">
            <div className="section-head" style={{ margin: "0 auto 40px", textAlign: "center" }}>
              <span className="section-tag">Early access</span>
              <h2>Be first in line</h2>
              <p>We&apos;re building in the open. Join now and we&apos;ll email you as soon as there&apos;s something to try.</p>
            </div>

            <motion.div
              className="waitlist-panel"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={revealUp}
            >
              <div className="role-toggle" role="group" aria-label="I am a" data-active="customer">
                <span className="role-toggle-highlight" aria-hidden="true"></span>
                <button type="button" id="roleCustomer" aria-pressed="true">
                  I need a tradesperson
                </button>
                <button type="button" id="roleTasker" aria-pressed="false">
                  I&apos;m a tradesperson
                </button>
              </div>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    className="waitlist-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSubmitted(true);
                    }}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="field-row">
                      <label htmlFor="wlEmail" style={{ position: "absolute", left: "-9999px" }}>
                        Email address
                      </label>
                      <input
                        type="email"
                        id="wlEmail"
                        name="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div className="field-row">
                      <label htmlFor="wlPostcode" style={{ position: "absolute", left: "-9999px" }}>
                        Postcode or area
                      </label>
                      <input
                        type="text"
                        id="wlPostcode"
                        name="postcode"
                        placeholder="Postcode or area (optional)"
                        autoComplete="postal-code"
                      />
                    </div>
                    <Magnetic strength={8} block>
                      <button className="btn btn-primary" type="submit">
                        Join the waitlist
                      </button>
                    </Magnetic>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    className="waitlist-success"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: easeOut }}
                  >
                    <span className="check-wrap" aria-hidden="true">
                      <svg viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="26" />
                        <path d="M19 31l7 7 15-16" />
                      </svg>
                    </span>
                    <h3>You&apos;re on the list.</h3>
                    <p>We&apos;ll email you the moment early access opens for your area.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="privacy-note">
                No spam — just one email when we launch. This is a design preview; sign-ups here aren&apos;t connected to a live mailing list yet.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="site">
        <div className="wrap footer-inner">
          <div>
            <a className="logo" href="#top">
              <LogoMark size={28} />
              Passionate Taskers
            </a>
            <p className="footer-tagline">The AI-powered, voice-first way to find a tradesperson you can trust.</p>
            <p className="footer-copy">© 2026 Passionate Taskers. Built accessibility-first.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <a href="#how">How it works</a>
            <a href="#accessibility">Accessibility statement</a>
            <a href="#pros">For tradespeople</a>
            <a href="#waitlist">Join waitlist</a>
          </nav>
        </div>
      </footer>
    </MotionConfig>
  );
}
