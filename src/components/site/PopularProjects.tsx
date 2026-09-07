"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CATEGORIES, POPULAR_PROJECTS } from "@/lib/marketplace";
import { ServiceCard } from "./ServiceCard";

const revealUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

/** Only offer filters for categories that actually have projects listed. */
const FILTERS = [
  { slug: "all", name: "All jobs" },
  ...CATEGORIES.filter((c) => POPULAR_PROJECTS.some((p) => p.categorySlug === c.slug)).map((c) => ({
    slug: c.slug,
    name: c.name,
  })),
];

export function PopularProjects() {
  const [active, setActive] = useState("all");

  const projects =
    active === "all"
      ? POPULAR_PROJECTS
      : POPULAR_PROJECTS.filter((p) => p.categorySlug === active);

  return (
    <section id="projects">
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">Popular jobs</span>
          <h2>What people are booking most</h2>
          <p>
            Transparent starting prices, so you know roughly what a job costs before you
            speak to anybody.
          </p>
        </div>

        <div className="filter-row" role="group" aria-label="Filter jobs by service">
          {FILTERS.map((filter) => (
            <button
              key={filter.slug}
              type="button"
              className="chip chip--filter"
              aria-pressed={active === filter.slug}
              onClick={() => setActive(filter.slug)}
            >
              {filter.name}
            </button>
          ))}
        </div>

        {/* Announced so a screen-reader user filtering the list hears the
            result count change, rather than silently re-rendered cards. */}
        <p className="visually-hidden" role="status">
          {projects.length} jobs shown
        </p>

        <motion.div
          className="project-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {projects.map((project) => (
            <motion.div key={project.id} variants={revealUp} layout>
              <ServiceCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
