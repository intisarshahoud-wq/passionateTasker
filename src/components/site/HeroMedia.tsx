"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { UNSPLASH, unsplashUrl } from "@/lib/marketplace";

/**
 * The hero backdrop: a still photograph with a video layered over it.
 *
 * The photograph is always rendered, so it is what shows if the video is still
 * loading, fails, or is suppressed — a missing video degrades into something
 * intentional instead of a black rectangle.
 *
 * Two rules the video follows:
 *  - it never autoplays for someone who asked for reduced motion,
 *  - it is always stoppable, via a real labelled control (WCAG 2.2.2 — any
 *    motion lasting more than five seconds needs a pause).
 */
export function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const attempt = () => {
      if (!el.paused) return;
      el.play()
        .then(() => setPlaying(true))
        .catch(() => {
          /* still refused — the labelled control below always works */
        });
    };

    attempt();
    el.addEventListener("canplay", attempt);

    /*
     * Browsers that refuse muted autoplay (and some stricter privacy settings)
     * will allow it once the visitor has interacted with the page at all. These
     * listeners are passive, fire once, and never block anything.
     */
    const onFirstInteraction = () => attempt();
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((event) =>
      window.addEventListener(event, onFirstInteraction, { once: true, passive: true })
    );

    return () => {
      el.removeEventListener("canplay", attempt);
      events.forEach((event) => window.removeEventListener(event, onFirstInteraction));
    };
  }, []);

  function toggle() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="hero-media">
      <Image
        src={unsplashUrl(UNSPLASH.heroTrades, 1920, 1080)}
        alt=""
        fill
        priority
        sizes="100vw"
        className="hero-media__img"
      />

      {!failed && (
        <video
          ref={videoRef}
          className={`hero-media__video${ready ? " is-ready" : ""}`}
          src="/hero.mp4"
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          onCanPlay={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      )}

      <span className="hero-media__scrim" />

      {!failed && (
        <button
          type="button"
          className="hero-media__toggle"
          onClick={toggle}
          aria-pressed={playing}
        >
          {playing ? (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="7" y="5" width="4" height="14" rx="1" />
                <rect x="13" y="5" width="4" height="14" rx="1" />
              </svg>
              Pause background video
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
              Play background video
            </>
          )}
        </button>
      )}
    </div>
  );
}
