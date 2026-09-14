"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * The clips the hero plays, in order: each plays once, then crossfades into
 * the next, and after the last it starts again from the first.
 *
 * All are free-licence Pexels clips, landscape, 1920x1080, H.264, silent, and
 * short (about 10 to 20 seconds). The frame crops them to 5:4 on wide screens
 * and 16:10 on narrow ones, so pick clips with the action near the centre.
 */
const CLIPS = [
  { src: "/videos/plumber.mp4", trade: "Plumbing" },
  { src: "/videos/electrician.mp4", trade: "Electrical" },
  { src: "/videos/handyman.mp4", trade: "Home repairs" },
] as const;

/** The still shown before the first clip plays, and whenever none can. */
const POSTER = "/videos/plumber-poster.jpg";

/** Crossfade length. Matches the opacity transition on .hero-media__video. */
const FADE_MS = 900;

const PAUSE_KEY = "pt-hero-video";

type Slot = 0 | 1;
const other = (slot: Slot): Slot => (slot === 0 ? 1 : 0);

/** Whether this visitor paused the hero video on an earlier visit. */
function readPausePreference(): boolean {
  try {
    return localStorage.getItem(PAUSE_KEY) === "paused";
  } catch {
    return false;
  }
}

function rememberPaused(paused: boolean) {
  try {
    localStorage.setItem(PAUSE_KEY, paused ? "paused" : "playing");
  } catch {
    /* blocked storage: the choice lasts for this visit only */
  }
}

/** The visitor's browser has asked sites to use less data. */
function prefersSavingData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

/**
 * The hero footage: a framed player beside the hero text, playing a playlist
 * of trade clips over a still frame, with a label naming the trade on screen.
 *
 * How it works: two <video> elements take turns. One is on screen; the other
 * quietly loads the next clip once the current one is playing, so each clip is
 * ready the moment the previous one ends and the two crossfade with no black
 * gap. The still underneath is a frame from the first clip, so the hero shows
 * a tradesperson at work while loading, if every clip fails, and when paused.
 *
 * How it behaves (Intisar's decisions, 2026-09-14):
 *  - It autoplays, muted, for every visitor, including those whose system asks
 *    for reduced motion. The footage is the hero.
 *  - It is always stoppable with a real labelled control (WCAG 2.2.2: motion
 *    lasting more than five seconds needs a pause), and a pause is remembered,
 *    so someone who stops it once never has it autoplay on them again.
 *  - A visitor whose browser asks to save data gets only the first clip, on a
 *    loop, and never downloads the others.
 *  - A clip that fails to load is skipped; the rest keep playing.
 *
 * The media events are wired up in an effect rather than as JSX props: the
 * sequencing reads and writes refs, and React's rules keep ref access out of
 * anything created during render.
 */
export function HeroMedia() {
  const slotA = useRef<HTMLVideoElement>(null);
  const slotB = useRef<HTMLVideoElement>(null);

  /** Which clip each of the two video elements holds (null: none yet). */
  const [slotClip, setSlotClip] = useState<(number | null)[]>([0, null]);
  const [active, setActive] = useState<Slot>(0);
  const [ready, setReady] = useState<boolean[]>([false, false]);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  // Shared between the effect below and the pause button.
  const activeRef = useRef<Slot>(0);
  const wantPlaying = useRef(true);

  useEffect(() => {
    const els = [slotA.current, slotB.current] as const;
    const slotClips: (number | null)[] = [0, null];
    const broken = new Set<number>();
    const rotate = CLIPS.length > 1 && !prefersSavingData();
    let fadeTimer: number | undefined;

    wantPlaying.current = !readPausePreference();

    function loadIntoSlot(slot: Slot, clip: number | null) {
      slotClips[slot] = clip;
      setSlotClip([...slotClips]);
      setReady((r) => r.map((value, i) => (i === slot ? false : value)));
    }

    /** The next clip after `after` that has not failed, or null if none. */
    function nextClip(after: number): number | null {
      for (let step = 1; step <= CLIPS.length; step++) {
        const i = (after + step) % CLIPS.length;
        if (!broken.has(i)) return i;
      }
      return null;
    }

    /** Load the clip that follows the one in `fromSlot` into the other slot. */
    function queueNext(fromSlot: Slot) {
      if (!rotate) return;
      const current = slotClips[fromSlot];
      if (current === null) return;
      const upcoming = nextClip(current);
      if (upcoming === null || upcoming === current) return;
      loadIntoSlot(other(fromSlot), upcoming);
    }

    function play(slot: Slot) {
      els[slot]
        ?.play()
        .then(() => setPlaying(true))
        .catch(() => {
          /* refused: the labelled control always works */
        });
    }

    function restart(slot: Slot) {
      const el = els[slot];
      if (!el) return;
      el.currentTime = 0;
      play(slot);
    }

    function onCanPlay(slot: Slot) {
      setReady((r) => r.map((value, i) => (i === slot ? true : value)));
      if (slot === activeRef.current && wantPlaying.current && els[slot]?.paused) play(slot);
    }

    function onPlaying(slot: Slot) {
      // Start fetching the next clip only once this one is running, so the
      // first clip never competes with the second for bandwidth.
      if (slot === activeRef.current && slotClips[other(slot)] === null) queueNext(slot);
    }

    function onEnded(slot: Slot) {
      if (slot !== activeRef.current) return;
      const idle = other(slot);
      const idleEl = els[idle];

      // Nothing queued (one clip, saving data, or the next one failed): loop.
      if (!idleEl || slotClips[idle] === null) {
        restart(slot);
        return;
      }

      idleEl.currentTime = 0;
      idleEl
        .play()
        .then(() => {
          activeRef.current = idle;
          setActive(idle);
          // Once the old clip has faded out, load the one after next into it.
          window.clearTimeout(fadeTimer);
          fadeTimer = window.setTimeout(() => queueNext(idle), FADE_MS + 100);
        })
        .catch(() => restart(slot));
    }

    function onError(slot: Slot) {
      const clip = slotClips[slot];
      if (clip === null) return;
      broken.add(clip);

      if (broken.size >= CLIPS.length) {
        setFailed(true);
        return;
      }
      if (slot === activeRef.current) {
        // The clip on screen failed: swap the next working one into its place.
        loadIntoSlot(slot, nextClip(clip));
      } else {
        // The queued clip failed: queue the one after it instead.
        queueNext(activeRef.current);
      }
    }

    const handlers = {
      canplay: onCanPlay,
      playing: onPlaying,
      ended: onEnded,
      error: onError,
    } as const;
    const detach: (() => void)[] = [];
    ([0, 1] as const).forEach((slot) => {
      const el = els[slot];
      if (!el) return;
      (Object.keys(handlers) as (keyof typeof handlers)[]).forEach((type) => {
        const listener = () => handlers[type](slot);
        el.addEventListener(type, listener);
        detach.push(() => el.removeEventListener(type, listener));
      });
    });

    // A cached first clip can be ready before the listeners above exist.
    if (els[0] && els[0].readyState >= 3) onCanPlay(0);

    const attempt = () => {
      const el = els[activeRef.current];
      if (!wantPlaying.current || !el || !el.paused) return;
      play(activeRef.current);
    };
    attempt();

    /*
     * Browsers that refuse muted autoplay (and some stricter privacy settings)
     * will allow it once the visitor has interacted with the page at all. These
     * listeners are passive, fire once, and never block anything.
     */
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((event) =>
      window.addEventListener(event, attempt, { once: true, passive: true })
    );

    return () => {
      detach.forEach((off) => off());
      events.forEach((event) => window.removeEventListener(event, attempt));
      window.clearTimeout(fadeTimer);
    };
  }, []);

  function toggle() {
    const el = (activeRef.current === 0 ? slotA : slotB).current;
    if (!el) return;
    if (el.paused) {
      wantPlaying.current = true;
      rememberPaused(false);
      el.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      wantPlaying.current = false;
      rememberPaused(true);
      el.pause();
      setPlaying(false);
    }
  }

  const srcOf = (slot: Slot) => {
    const clip = slotClip[slot];
    return clip === null ? undefined : CLIPS[clip].src;
  };
  const shownClip = slotClip[active] ?? 0;
  const classOf = (slot: Slot) =>
    `hero-media__video${slot === active && ready[slot] ? " is-visible" : ""}`;

  return (
    <div className="hero-media">
      <Image
        src={POSTER}
        alt=""
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="hero-media__img"
      />

      {/* Both slots are always in the DOM so the effect can wire them once.
          The waiting slot has no source until its clip is queued, then loads
          it in full, ready for its turn. */}
      {!failed && (
        <>
          <video
            ref={slotA}
            className={classOf(0)}
            src={srcOf(0)}
            poster={slotClip[0] === 0 ? POSTER : undefined}
            muted
            playsInline
            preload={active === 0 ? "metadata" : "auto"}
            aria-hidden="true"
            tabIndex={-1}
          />
          <video
            ref={slotB}
            className={classOf(1)}
            src={srcOf(1)}
            muted
            playsInline
            preload={active === 1 ? "metadata" : "auto"}
            aria-hidden="true"
            tabIndex={-1}
          />
        </>
      )}

      {/* Which trade is on screen. Solid background, so it stays readable over
          any frame; hidden from screen readers like the footage itself. */}
      <span className="hero-media__label" aria-hidden="true">
        <span className="hero-media__label-dot" />
        {CLIPS[shownClip].trade}
      </span>

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
