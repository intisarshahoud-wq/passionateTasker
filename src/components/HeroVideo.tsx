"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero media. Autoplays muted+looping for the cinematic effect, but:
 *  - honours prefers-reduced-motion by staying paused on a still frame,
 *  - always exposes a play/pause control so motion is never unavoidable,
 *  - falls back to the poster (and a caption) if the source is missing,
 *    so a missing file degrades quietly instead of showing a broken box.
 *
 * Drop your file at /public/hero.mp4 (and optionally /public/hero-poster.jpg).
 */
export function HeroVideo({
  src = "/hero.mp4",
  poster = "/hero-poster.jpg",
  fallback,
}: {
  src?: string;
  poster?: string;
  fallback?: React.ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    el.play()
      .then(() => setPlaying(true))
      .catch(() => {
        /* autoplay blocked by the browser — the manual control still works */
      });
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

  // No usable video: render the mock instead of an empty frame.
  if (failed) return <>{fallback}</>;

  return (
    <div className="hero-video">
      <video
        ref={videoRef}
        className="hero-video__el"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        aria-label="Passionate Taskers overview"
      />

      <button
        type="button"
        className="hero-video__toggle"
        onClick={toggle}
        aria-pressed={playing}
      >
        {playing ? (
          <>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <rect x="7" y="5" width="4" height="14" rx="1" />
              <rect x="13" y="5" width="4" height="14" rx="1" />
            </svg>
            Pause
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
            Play
          </>
        )}
      </button>
    </div>
  );
}
