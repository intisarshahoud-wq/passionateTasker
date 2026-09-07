"use client";

import { motion } from "motion/react";
import { TRUST_POINTS } from "@/lib/marketplace";
import { Icon } from "./Icon";

const revealUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

/**
 * Trust is the product, not a section — this is the answer to "am I safe
 * letting this person into my home", so it sits directly after discovery and
 * before any ask.
 */
export function TrustSection() {
  return (
    <section id="trust">
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">Trust and safety</span>
          <h2>Checked before they ever knock on your door</h2>
          <p>
            You are letting a stranger into your home. Every check below happens before a
            tradesperson can accept a single job — not after something goes wrong.
          </p>
        </div>

        <motion.div
          className="trust-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {TRUST_POINTS.map((point) => (
            <motion.article className="trust-card" key={point.title} variants={revealUp}>
              <span className="trust-card__icon" aria-hidden="true">
                <Icon name={point.icon} />
              </span>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </motion.article>
          ))}
        </motion.div>

        <p className="section-note">
          Verification is carried out at sign-up and re-checked annually. We are pre-launch,
          so these are the standards we are building to, not claims about work already done.
        </p>
      </div>
    </section>
  );
}
