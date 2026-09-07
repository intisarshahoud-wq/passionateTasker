"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { UNSPLASH, unsplashUrl } from "@/lib/marketplace";
import { Icon } from "./Icon";
import type { IconName } from "@/lib/marketplace";

const BENEFITS: { icon: IconName; label: string }[] = [
  { icon: "badge", label: "AI-qualified leads matched to your trade, your area and your diary" },
  { icon: "mic", label: "Answer by voice while you are on the job with your hands full" },
  { icon: "chat", label: "One thread per job — no missed calls, no chasing for details" },
  { icon: "card", label: "Free during early access. No subscription, no per-lead charge" },
];

const revealUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

/** The supply side. A two-sided marketplace has to sell to both sides. */
export function ProSection() {
  return (
    <section id="pros">
      <motion.div
        className="wrap pro-band"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div variants={revealUp}>
          <span className="section-tag">For tradespeople</span>
          <h2>Spend less of the week chasing leads</h2>
          <p className="pro-band__lede">
            Every lead arrives already written up: what the job is, how urgent it is, and what
            the customer actually needs. You decide before you pick up the phone.
          </p>
          <ul>
            {BENEFITS.map((benefit) => (
              <li key={benefit.label}>
                <Icon name={benefit.icon} />
                {benefit.label}
              </li>
            ))}
          </ul>
          <a className="btn btn-outline" href="#waitlist">
            Join the tradesperson waitlist
          </a>
        </motion.div>

        <motion.div variants={revealUp}>
          <div className="pro-photo">
            <Image
              src={unsplashUrl(UNSPLASH.proAtWork, 900, 620)}
              alt="A tradesperson going over job plans at a workbench"
              fill
              sizes="(max-width: 860px) 100vw, 45vw"
              className="pro-photo__img"
            />
          </div>

          <div className="pro-stat-card">
          <div className="big">Free</div>
          <div className="label">
            to join during early access — no subscription and no listing fee
          </div>
          <hr />
          <div className="big">3</div>
          <div className="label">
            trades launching first: plumbing, electrical and handyman work
          </div>
          <hr />
          <div className="big">1</div>
          <div className="label">
            thread per job, carrying the quote, the schedule and the photos
          </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
