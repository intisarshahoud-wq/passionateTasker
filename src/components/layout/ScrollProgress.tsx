"use client";

import { useEffect, useState } from "react";

/** Thin reading-position bar. Decorative, so it is hidden from assistive tech. */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="scroll-progress"
      aria-hidden="true"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
