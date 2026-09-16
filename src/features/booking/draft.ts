/**
 * The booking draft: the answers the booking flow collects, how they are kept
 * for the tab, and how another page can hand over answers it already knows.
 *
 * Shared by the booking flow itself, its voice guide, and the hero search
 * (which can start a booking with the service, postcode and time a person has
 * already said out loud).
 */

import type { TaskSize } from "@/data/services";

export type SlotId = "morning" | "afternoon" | "evening";

export const SLOTS: { id: SlotId; label: string; hours: string }[] = [
  { id: "morning", label: "Morning", hours: "8am to 12pm" },
  { id: "afternoon", label: "Afternoon", hours: "12pm to 5pm" },
  { id: "evening", label: "Evening", hours: "5pm to 8pm" },
];

export interface Draft {
  step: number;
  postcode: string;
  size: TaskSize | "";
  answer: string;
  details: string;
  taskerId: string;
  date: string;
  slot: SlotId | "";
  name: string;
  email: string;
  phone: string;
}

export const EMPTY: Draft = {
  step: 0,
  postcode: "",
  size: "",
  answer: "",
  details: "",
  taskerId: "",
  date: "",
  slot: "",
  name: "",
  email: "",
  phone: "",
};

export const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface Day {
  iso: string;
  label: string;
  long: string;
  /** Lower-case weekday name, for matching what people say ("friday"). */
  weekday: string;
}

/** Today and the next few days, labelled the way people say them. */
export function upcomingDays(count: number, from = new Date()): Day[] {
  const short = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const long = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long" });
  const start = new Date(from);
  start.setHours(12, 0, 0, 0);

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const prefix = i === 0 ? "Today, " : i === 1 ? "Tomorrow, " : "";
    return {
      iso,
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : short.format(d),
      long: prefix + long.format(d),
      weekday: weekday.format(d).toLowerCase(),
    };
  });
}

/** How many days ahead the booking flow offers. */
export const DAYS_AHEAD = 7;

export const storageKey = (category: string, service: string) => `pt-booking-${category}-${service}`;

export function loadDraft(key: string): Draft {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) };
  } catch {
    /* blocked or corrupt storage: start fresh */
  }
  return EMPTY;
}

/** Query flag that tells the booking page to start its voice guide. */
export const VOICE_FLAG = "voice";

/**
 * Start a booking with answers that are already known, from step one. Anything
 * not passed is left empty for the flow (or its voice guide) to ask about.
 * Returns false if storage is blocked, in which case the booking starts empty.
 */
export function prefillBooking(category: string, service: string, answers: Partial<Draft>): boolean {
  try {
    sessionStorage.setItem(storageKey(category, service), JSON.stringify({ ...EMPTY, ...answers, step: 0 }));
    return true;
  } catch {
    return false;
  }
}
