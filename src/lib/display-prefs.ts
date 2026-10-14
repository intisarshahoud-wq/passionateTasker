/**
 * Display preferences (light mode, larger text, high contrast) as a tiny
 * external store.
 *
 * These live outside React on purpose. The real source of truth is the set of
 * data attributes on <html>, which globals.css keys the themes and the
 * larger-text scale off, and which a blocking script in layout.tsx applies
 * before first paint so a returning visitor never sees a flash of the wrong
 * theme. React subscribes to that state rather than owning it, which is exactly
 * what useSyncExternalStore is for — and it keeps the toggle buttons'
 * aria-pressed values honest without a cascading setState-in-effect.
 */

export type Mode = "dark" | "light";
export type TextSize = "normal" | "lg";
export type Contrast = "normal" | "high";

export interface DisplayPrefs {
  mode: Mode;
  textSize: TextSize;
  contrast: Contrast;
}

export const MODE_KEY = "pt-mode";
export const TEXT_KEY = "pt-text";
export const CONTRAST_KEY = "pt-contrast";

const DEFAULTS: DisplayPrefs = { mode: "dark", textSize: "normal", contrast: "normal" };

/**
 * The first client snapshot must match what the server rendered, or React
 * reports a hydration mismatch. So this starts at the defaults and is corrected
 * by restoreDisplayPrefs() once mounted.
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

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    /* private mode or blocked storage */
    return null;
  }
}

/** Remember one choice. Only the setting that was changed is written. */
function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode or blocked storage — the session still works, it just
       will not be remembered next visit */
  }
}

/**
 * What this visitor should see: their saved choices, and for contrast, what
 * their device asks for when they have not chosen here. The same logic as the
 * pre-paint script in layout.tsx; keep the two in step.
 */
function preferred(): DisplayPrefs {
  const storedContrast = read(CONTRAST_KEY);
  let contrast: Contrast;
  if (storedContrast === "high" || storedContrast === "normal") {
    contrast = storedContrast;
  } else {
    contrast = window.matchMedia?.("(prefers-contrast: more)").matches ? "high" : "normal";
  }
  return {
    mode: read(MODE_KEY) === "light" ? "light" : "dark",
    textSize: read(TEXT_KEY) === "lg" ? "lg" : "normal",
    contrast,
  };
}

function paint(prefs: DisplayPrefs) {
  const root = document.documentElement;
  root.setAttribute("data-mode", prefs.mode);
  root.setAttribute("data-text", prefs.textSize);
  root.setAttribute("data-contrast", prefs.contrast);
}

/**
 * Bring the store, and the attributes on <html>, in line with what this visitor
 * chose. Called once a component that shows the settings has mounted.
 *
 * In production the pre-paint script has already set the attributes, so this
 * only updates the store. It re-applies them as well because React's Strict
 * Mode, in development, can reset <html> to the attributes it knows about.
 */
export function restoreDisplayPrefs() {
  const prefs = preferred();
  paint(prefs);
  if (
    prefs.mode === snapshot.mode &&
    prefs.textSize === snapshot.textSize &&
    prefs.contrast === snapshot.contrast
  ) {
    return;
  }
  snapshot = prefs;
  emit();
}

export function setMode(mode: Mode) {
  snapshot = { ...snapshot, mode };
  paint(snapshot);
  remember(MODE_KEY, mode);
  emit();
}

export function setTextSize(textSize: TextSize) {
  snapshot = { ...snapshot, textSize };
  paint(snapshot);
  remember(TEXT_KEY, textSize);
  emit();
}

export function setContrast(contrast: Contrast) {
  snapshot = { ...snapshot, contrast };
  paint(snapshot);
  remember(CONTRAST_KEY, contrast);
  emit();
}
