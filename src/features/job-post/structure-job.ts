/**
 * Turning a sentence into a structured job post.
 *
 * This is the product's actual differentiator, so it lives in one place and is
 * shared by every surface that offers it — the hero search and the chat
 * assistant both call `structureJob()`, and both will keep working when the
 * keyword match below is replaced by a real Claude call.
 */

import { CATEGORIES } from "@/data/services";

const URGENT_WORDS = [
  "burst", "flood", "flooding", "emergency", "urgent", "leak", "leaking",
  "no heating", "no heat", "no hot water", "no power", "sparking", "smell of gas",
  "gas leak", "today", "asap",
];

export interface StructuredJob {
  query: string;
  category: string;
  categorySlug: string;
  categoryLive: boolean;
  /** Indicative hourly rate anchor for the matched category, in GBP. */
  fromPrice: number;
  priority: string;
  matches: number;
}

/**
 * Naive keyword match, standing in for the Claude call that will do this
 * properly later. Scores each category on how many of its task words appear in
 * the query, so "my kitchen tap is dripping" lands on Plumbing.
 */
export function structureJob(query: string): StructuredJob {
  const q = query.toLowerCase();
  let best = CATEGORIES[0];
  let bestScore = 0;

  for (const category of CATEGORIES) {
    const words = [category.name, ...category.tasks]
      .join(" ")
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((w) => w.length > 3);

    const score = new Set(words.filter((w) => q.includes(w))).size;
    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }

  // Nothing matched a category vocabulary — a handyman triages the rest.
  if (bestScore === 0) {
    best = CATEGORIES.find((c) => c.slug === "home-repairs") ?? CATEGORIES[0];
  }

  const urgent = URGENT_WORDS.some((w) => q.includes(w));

  return {
    query,
    category: best.name,
    categorySlug: best.slug,
    categoryLive: best.availability === "live",
    fromPrice: best.fromPrice,
    priority: urgent ? "Same day" : "Within a few days",
    matches: best.availability === "live" ? 3 : 0,
  };
}
