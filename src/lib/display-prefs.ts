/**
 * Display preferences (light mode, larger text) as a tiny external store.
 *
 * These live outside React on purpose. The real source of truth is the pair of
 * data attributes on <html>, which globals.css keys the light theme and the
 * larger-text scale off, and which a blocking script in layout.tsx applies
 * before first paint so a returning visitor never sees a flash of the wrong
 * theme. React subscribes to that state rather than owning it, which is exactly
 * what useSyncExternalStore is for — and it keeps the toggle buttons'
 * aria-pressed values honest without a cascading setState-in-effect.
 */

export type Mode = "dark" | "light";
export type TextSize = "normal" | "lg";

export interface DisplayPrefs {
  mode: Mode;
  textSize: TextSize;
}

export const MODE_KEY = "pt-mode";
export const TEXT_KEY = "pt-text";

const DEFAULTS: DisplayPrefs = { mode: "dark", textSize: "normal" };

/**
 * The first client snapshot must match what the server rendered, or React
 * reports a hydration mismatch. So this starts at the defaults and is corrected
 * by syncFromDom() once mounted.
 */
let snapshot: DisplayPrefs = DEFAULTS;
let listeners: (() => void)[] = [];

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getSnapshot(): DisplayPrefs {
  return snapshot;
}

export function getServerSnapshot(): DisplayPrefs {
  return DEFAULTS;
}

function apply(prefs: DisplayPrefs) {
  const root = document.documentElement;
  root.setAttribute("data-mode", prefs.mode);
  root.setAttribute("data-text", prefs.textSize);
  try {
    localStorage.setItem(MODE_KEY, prefs.mode);
    localStorage.setItem(TEXT_KEY, prefs.textSize);
  } catch {
    /* private mode or blocked storage — the session still works, it just
       will not be remembered next visit */
  }
}

/** Adopt whatever the pre-paint script already put on <html>. */
export function syncFromDom() {
  const root = document.documentElement;
  const mode = root.getAttribute("data-mode") === "light" ? "light" : "dark";
  const textSize = root.getAttribute("data-text") === "lg" ? "lg" : "normal";
  if (mode === snapshot.mode && textSize === snapshot.textSize) return;
  snapshot = { mode, textSize };
  emit();
}

export function setMode(mode: Mode) {
  snapshot = { ...snapshot, mode };
  apply(snapshot);
  emit();
}

export function setTextSize(textSize: TextSize) {
  snapshot = { ...snapshot, textSize };
  apply(snapshot);
  emit();
}
