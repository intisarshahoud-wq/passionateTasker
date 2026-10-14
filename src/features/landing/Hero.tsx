"use client";

import { Fragment } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { IconName } from "@/data/marketplace";
import { TRENDING, bookingHref } from "@/data/services";
import { getCheck } from "@/data/trust";
import { Icon } from "@/components/ui/Icon";
import { SITE } from "@/lib/site";
import { HeroMedia } from "./HeroMedia";
import { TaskSearch } from "@/features/job-post/TaskSearch";

const easeOut = [0.22, 1, 0.36, 1] as const;

/*
 * Entrances stay inside the motion limits the site works to: a fade with at
 * most 12px of travel, finished within 400ms, played once.
 */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

const headlineContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.08 } },
};
const headlineWord = {
  hidden: { opacity: 0, y: 6, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: easeOut },
  },
};

const LINE_1 = ["Tell", "us", "what", "needs", "fixing."];
const LINE_2 = ["We’ll", "find", "who", "can", "fix", "it."];

/**
 * The checks, in the exact words a profile's badges use (data/trust.ts), so
 * the first promise on the page says what is checked rather than "verified".
 */
const TRUST_STRIP: { icon: IconName; label: string }[] = [
  ...(["identity", "insurance", "registration"] as const).map((id) => {
    const check = getCheck(id);
    return { icon: check.icon, label: check.badge };
  }),
  { icon: "mic", label: "Works by voice, end to end" },
];

/** A few of the most-booked jobs, each a quick way straight into booking. */
const QUICK_JOBS = TRENDING.slice(0, 4);

/**
 * The hero: trade footage filling the background, with the message and the
 * search on the left.
 *
 * The text is kept to the left so the right of the video can be shown clear;
 * the scrim in hero.css darkens only where the text sits. On narrow screens
 * the video becomes a banner above the text instead (see hero.css).
 */
export function Hero() {
  return (
    <section className="hero" id="top">
      <HeroMedia />

      <div className="wrap hero-content">
        <motion.div className="hero-copy" variants={container} initial="hidden" animate="show">
            {/* The line that says what we are trying to be. A paragraph, not
                part of the heading: the h1 stays the promise to the visitor. */}
            <motion.p className="eyebrow hero-positioning" variants={item}>
              <span className="dot" aria-hidden="true" />
              {SITE.positioning}
            </motion.p>

            <motion.h1 className="hero-title" variants={headlineContainer}>
              {LINE_1.map((word, i) => (
                <Fragment key={`l1-${i}`}>
                  <motion.span variants={headlineWord} style={{ display: "inline-block" }}>
                    {word}
                  </motion.span>
                  {i < LINE_1.length - 1 ? " " : ""}
                </Fragment>
              ))}
              <br />
              <span className="hero-title__accent">
                {LINE_2.map((word, i) => (
                  <Fragment key={`l2-${i}`}>
                    <motion.span variants={headlineWord} style={{ display: "inline-block" }}>
                      {word}
                    </motion.span>
                    {i < LINE_2.length - 1 ? " " : ""}
                  </Fragment>
                ))}
              </span>
            </motion.h1>

            <motion.p className="hero-lede" variants={item}>
              Describe the job in your own words, by voice or by text. We turn it into a proper
              job post and match you with identity-verified, insured tradespeople near you.
            </motion.p>

            <motion.div variants={item}>
              <TaskSearch />
            </motion.div>

            <motion.div className="hero-chips" variants={item}>
              <span className="hero-chips__label">Popular right now</span>
              <ul>
                {QUICK_JOBS.map(({ category, service }) => (
                  <li key={`${category.slug}-${service.slug}`}>
                    <Link className="chip" href={bookingHref(category.slug, service.slug)}>
                      <Icon name={category.icon} className="chip__icon" />
                      {service.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <a className="chip chip--ghost" href="#services">
                    See all services
                  </a>
                </li>
              </ul>
            </motion.div>
        </motion.div>

        <motion.ul
          className="trust-strip"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut, delay: 0.4 }}
        >
          {TRUST_STRIP.map((point) => (
            <li key={point.label}>
              <Icon name={point.icon} className="trust-strip__icon" />
              {point.label}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
