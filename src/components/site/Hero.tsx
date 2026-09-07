"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { CATEGORIES } from "@/lib/marketplace";
import { Icon } from "./Icon";
import { HeroMedia } from "./HeroMedia";
import { TaskSearch } from "./TaskSearch";

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

/** The three trades we can actually serve at launch, shown as quick entry points. */
const QUICK_CATEGORIES = CATEGORIES.filter((c) => c.availability === "live");

export function Hero() {
  return (
    <section className="hero" id="top">
      <HeroMedia />

      <div className="ambient" aria-hidden="true">
        <span className="b1" />
        <span className="b2" />
        <span className="b3" />
      </div>

      <div className="wrap hero-inner">
        <motion.div variants={container} initial="hidden" animate="show">
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
              {QUICK_CATEGORIES.map((category) => (
                <li key={category.id}>
                  <a className="chip" href="#projects">
                    <Icon name={category.icon} className="chip__icon" />
                    {category.name}
                  </a>
                </li>
              ))}
              <li>
                <a className="chip chip--ghost" href="#categories">
                  See all services
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.ul className="trust-strip" variants={item}>
            {TRUST_STRIP.map((point) => (
              <li key={point.label}>
                <Icon name={point.icon} className="trust-strip__icon" />
                {point.label}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
