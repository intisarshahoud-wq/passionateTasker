"use client";

import { Fragment } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { TRENDING, bookingHref } from "@/data/services";
import { Icon } from "@/components/ui/Icon";
import { HeroMedia } from "./HeroMedia";
import { TaskSearch } from "@/features/job-post/TaskSearch";

const easeOut = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const item = {
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

const LINE_1 = ["Tell", "us", "what", "needs", "fixing."];
const LINE_2 = ["We’ll", "find", "who", "can", "fix", "it."];

const TRUST_STRIP = [
  { icon: "badge" as const, label: "ID and DBS checked" },
  { icon: "shield" as const, label: "Gas Safe and NICEIC verified" },
  { icon: "card" as const, label: "Insured on every job" },
  { icon: "mic" as const, label: "Works by voice, end to end" },
];

/** A few of the most-booked jobs, each a quick way straight into booking. */
const QUICK_JOBS = TRENDING.slice(0, 4);

/**
 * The hero: the message and the search on the left, the trade footage on the
 * right.
 *
 * Side by side, not layered. The video used to fill the whole hero behind the
 * text, which put the part of each clip worth seeing (the tap, the wrench, the
 * light fitting) directly behind the words, where it had to be darkened and
 * blurred for them to stay readable. Split, the footage is shown clear and in
 * full, and the text sits on the plain page background, so its contrast never
 * depends on what the video happens to be showing.
 */
export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-split">
          <motion.div className="hero-copy" variants={container} initial="hidden" animate="show">
            <motion.span className="eyebrow" variants={item}>
              <span className="dot" aria-hidden="true" />
              Accessibility-first, from day one — now in early access
            </motion.span>

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
              job post and match you with verified, insured tradespeople near you.
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

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut, delay: 0.25 }}
          >
            <HeroMedia />
          </motion.div>
        </div>

        <motion.ul
          className="trust-strip"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.5 }}
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
