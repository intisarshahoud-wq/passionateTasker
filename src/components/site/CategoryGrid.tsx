"use client";

import { motion } from "motion/react";
import { CATEGORIES } from "@/lib/marketplace";
import CursorGrid from "@/components/reactbits/CursorGrid";
import { Icon } from "./Icon";

const revealUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

/**
 * Service discovery. Categories that we can serve today are live links;
 * the rest are honestly marked as not launched instead of implying a catalogue
 * we cannot yet fulfil — an empty search result is a worse first impression
 * than an upfront "not yet".
 */
export function CategoryGrid() {
  return (
    <section id="categories">
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">Services</span>
          <h2>Pick the job, not the job title</h2>
          <p>
            You should not need to know whether a dripping tap is a plumber or a handyman.
            Choose the job you actually have — we work out who is right for it.
          </p>
        </div>

        <CursorGrid>
          <motion.ul
            className="category-grid"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            {CATEGORIES.map((category) => {
              const live = category.availability === "live";
              return (
                <motion.li key={category.id} variants={revealUp}>
                  <a
                    className={`category-card${live ? "" : " is-soon"}`}
                    href={live ? "#projects" : "#waitlist"}
                  >
                    <span className="category-card__icon" aria-hidden="true">
                      <Icon name={category.icon} />
                    </span>

                    <span className="category-card__head">
                      <span className="category-card__name">{category.name}</span>
                      <span className={`pill${live ? " pill--live" : ""}`}>
                        {live ? "Available now" : "Coming soon"}
                      </span>
                    </span>

                    <span className="category-card__tasks">
                      {category.tasks.slice(0, 3).join(" · ")}
                    </span>

                    <span className="category-card__price">
                      from <strong>£{category.fromPrice}</strong>
                    </span>
                  </a>
                </motion.li>
              );
            })}
          </motion.ul>
        </CursorGrid>

        <p className="section-note">
          Prices are indicative starting points for typical UK jobs, shown so you can budget
          before you speak to anyone. Your tradesperson confirms the real price before any work begins.
        </p>
      </div>
    </section>
  );
}
