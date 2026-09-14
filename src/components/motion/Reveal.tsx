"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/**
 * Scroll-reveal building blocks, shared by every section.
 *
 * These exist so that sections can stay server components. A section whose only
 * interactivity is "fade up when scrolled into view" should not have to become
 * browser JavaScript for it: it renders on the server and wraps just the parts
 * that move in these small client components.
 *
 * Reduced motion is handled once for the whole site by `MotionProvider`.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

type RevealTag = "div" | "ul" | "li" | "article" | "figure";

interface BaseProps {
  as?: RevealTag;
  className?: string;
  children: ReactNode;
}

/** Fades its RevealItem children up one after another when scrolled into view. */
export function RevealGroup({
  as = "div",
  className,
  children,
  stagger = 0.06,
  amount = 0.15,
}: BaseProps & { stagger?: number; amount?: number }) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Component>
  );
}

/** One item inside a RevealGroup. Takes its timing from the group. */
export function RevealItem({
  as = "div",
  className,
  children,
  layout = false,
}: BaseProps & { layout?: boolean }) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component className={className} variants={revealUp} layout={layout}>
      {children}
    </Component>
  );
}

/** A single block that fades up on its own when scrolled into view. */
export function Reveal({
  as = "div",
  className,
  children,
  amount = 0.2,
}: BaseProps & { amount?: number }) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={revealUp}
    >
      {children}
    </Component>
  );
}
