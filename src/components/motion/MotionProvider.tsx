"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Makes every Motion animation on the site honour the visitor's reduced-motion
 * setting. It is its own client component so the layouts that use it can stay
 * server components.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
