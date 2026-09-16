/**
 * Understanding what people say when they book by voice.
 *
 * Plain keyword and pattern matching, no model call: it has to work with no
 * backend and no API key, and every guess it makes is read back to the person
 * before anything moves on, so a wrong guess costs one "no", never a wrong
 * booking. When a real language model is added, `understandRequest()` is the
 * seam: return the same `BookingRequest` shape and nothing else changes.
 *
 * Everything here takes the raw words from the speech recogniser, which
 * arrive without punctuation and with numbers sometimes spelled out ("two"),
 * sometimes as digits ("2").
 */

import {
  SERVICE_CATEGORIES,
  type ServiceCategory,
  type SubService,
  type TaskSize,
} from "@/data/services";
import { POSTCODE, type Day, type Draft, type SlotId } from "./draft";

/* ---- Normalising ---- */

const NUMBER_WORDS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5",
  six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
};

/**
 * Inside a postcode or phone number, recognisers also write digits as the
 * words they sound like. Only used there: in a sentence, "for" means "for".
 */
const DIGIT_SOUNDS: Record<string, string> = { ...NUMBER_WORDS, oh: "0", to: "2", too: "2", for: "4", ate: "8" };

/** Lower case, punctuation turned to spaces, single spaces, padded with spaces. */
function clean(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9@.' ]+/g, " ").replace(/[.']/g, " ").replace(/\s+/g, " ").trim()} `;
}

/** Whole-word or whole-phrase match, so "tap" does not match "tape". */
function has(cleaned: string, phrase: string): boolean {
  // The phrase is cleaned the same way, so "don't" in a list matches "don t".
  return cleaned.includes(clean(phrase));
}

function hasAny(cleaned: string, phrases: string[]): boolean {
  return phrases.some((p) => has(cleaned, p));
}

/* ---- Which service ---- */

/** Words that point at a whole category. Weak words count for half. */
const CATEGORY_WORDS: Record<string, { strong: string[]; weak?: string[] }> = {
  assembly: { strong: ["assemble", "assembly", "flat pack", "flatpack", "ikea", "put together", "build furniture"] },
  mounting: { strong: ["mount", "mounting", "mounted", "hang", "hanging", "put up", "bracket"] },
  moving: { strong: ["move", "moving", "removal", "removals", "man and van", "van"], weak: ["carry", "lift"] },
  cleaning: { strong: ["clean", "cleaner", "cleaning", "hoover", "vacuum", "dust", "dusting"] },
  "outdoor-help": { strong: ["garden", "gardener", "gardening", "lawn", "grass", "hedge", "patio", "gutter", "gutters", "weeds", "outdoor", "outside"] },
  "home-repairs": { strong: ["handyman", "odd job", "odd jobs"], weak: ["fix", "fixing", "repair", "repairs", "broken", "mend"] },
  painting: { strong: ["paint", "painter", "painting", "decorator", "decorating", "wallpaper"] },
  plumbing: { strong: ["plumber", "plumbing", "leak", "leaking", "leaks", "drip", "dripping", "tap", "taps", "toilet", "drain", "blocked", "radiator", "shower", "pipe", "pipes", "water"] },
  electrical: { strong: ["electrician", "electric", "electrical", "electrics", "electricity", "socket", "sockets", "switch", "switches", "light", "lights", "lighting", "fuse", "fuses", "wiring", "power", "sparking", "sparks", "trip", "tripping"] },
};

/** Words that point at one job inside a category. */
const SERVICE_WORDS: Record<string, string[]> = {
  "assembly/furniture-assembly": ["furniture", "flat pack", "sofa bed", "bedside", "chest of drawers", "bookcase"],
  "assembly/wardrobe-assembly": ["wardrobe", "wardrobes"],
  "assembly/bed-assembly": ["bed", "beds", "bunk bed", "bed frame"],
  "assembly/desk-assembly": ["desk", "office chair", "home office"],
  "assembly/nursery-assembly": ["cot", "nursery", "crib", "changing unit"],
  "assembly/garden-furniture-assembly": ["garden furniture", "bench", "garden table"],
  "mounting/tv-mounting": ["tv", "television", "telly"],
  "mounting/shelves": ["shelf", "shelves", "shelving"],
  "mounting/pictures-mirrors": ["picture", "pictures", "mirror", "mirrors", "frame", "frames"],
  "mounting/curtains-blinds": ["curtain", "curtains", "curtain pole", "blind", "blinds"],
  "mounting/wall-cabinets": ["cabinet", "cabinets", "wall cabinet"],
  "moving/help-moving": ["moving house", "move house", "moving home", "new house", "new flat", "moving flat"],
  "moving/heavy-lifting": ["heavy", "lifting", "upstairs", "downstairs"],
  "moving/furniture-removal": ["old furniture", "get rid of", "dispose", "take away"],
  "moving/packing": ["pack", "packing", "unpack", "unpacking", "boxes"],
  "moving/rubbish-removal": ["rubbish", "junk", "waste", "tip", "clear the loft", "clear the garage"],
  "cleaning/deep-clean": ["deep clean", "spring clean", "top to bottom"],
  "cleaning/end-of-tenancy": ["end of tenancy", "moving out", "tenancy", "landlord", "deposit"],
  "cleaning/regular-clean": ["regular", "weekly", "fortnightly", "every week"],
  "cleaning/oven-clean": ["oven", "hob", "extractor"],
  "cleaning/window-cleaning": ["window", "windows"],
  "outdoor-help/lawn-mowing": ["lawn", "grass", "mow", "mowing"],
  "outdoor-help/hedge-trimming": ["hedge", "hedges", "bush", "bushes"],
  "outdoor-help/garden-clearance": ["overgrown", "clearance", "clear the garden", "weeds"],
  "outdoor-help/jet-washing": ["patio", "jet wash", "jet washing", "pressure wash", "driveway", "path"],
  "outdoor-help/gutter-clearing": ["gutter", "gutters", "downpipe"],
  "home-repairs/odd-jobs": ["odd jobs", "list of jobs", "few jobs", "small jobs", "handyman"],
  "home-repairs/doors-locks": ["door", "doors", "lock", "locks", "handle", "latch"],
  "home-repairs/cupboards-drawers": ["cupboard", "cupboards", "drawer", "drawers", "hinge", "hinges"],
  "home-repairs/sealant-grout": ["sealant", "grout", "silicone", "reseal"],
  "home-repairs/wall-repairs": ["hole in the wall", "hole", "crack", "cracks", "plaster"],
  "painting/room-painting": ["room", "walls", "bedroom", "living room", "lounge"],
  "painting/ceiling-painting": ["ceiling"],
  "painting/feature-wall": ["feature wall", "wallpaper"],
  "painting/woodwork": ["skirting", "woodwork", "trim", "banister"],
  "painting/fences-sheds": ["fence", "fences", "shed"],
  "plumbing/leaking-tap": ["tap", "taps", "dripping tap", "leaking tap"],
  "plumbing/blocked-drain": ["blocked", "drain", "sink", "clogged", "blockage"],
  "plumbing/toilet-repair": ["toilet", "loo", "flush", "cistern"],
  "plumbing/radiator-repair": ["radiator", "radiators"],
  "plumbing/appliance-plumbing": ["washing machine", "dishwasher"],
  "plumbing/shower-repair": ["shower"],
  "electrical/light-fitting": ["light fitting", "ceiling light", "spotlight", "spotlights", "pendant", "lamp", "light", "lights"],
  "electrical/sockets-switches": ["socket", "sockets", "switch", "switches", "plug", "usb"],
  "electrical/fault-finding": ["fuse", "fuses", "trip", "tripping", "tripped", "no power", "sparking", "sparks", "flickering", "flicker", "fault", "dead", "burning smell"],
  "electrical/outdoor-lighting": ["outdoor light", "outside light", "garden light", "security light"],
  "electrical/smoke-alarms": ["smoke alarm", "smoke alarms", "smoke detector", "fire alarm"],
};

function scoreWords(cleaned: string, words: string[], weight = 1): number {
  // Longer phrases are more specific, so they count for more.
  return words.reduce((sum, w) => sum + (has(cleaned, w) ? weight * w.split(" ").length : 0), 0);
}

export interface ServiceMatch {
  category: ServiceCategory | null;
  service: SubService | null;
}

/** The category and job a sentence is most likely about. Either may be null. */
export function matchService(text: string, within?: ServiceCategory): ServiceMatch {
  const cleaned = clean(text);
  let best: { category: ServiceCategory; service: SubService | null; score: number } | null = null;

  for (const category of within ? [within] : SERVICE_CATEGORIES) {
    const words = CATEGORY_WORDS[category.slug];
    let score = words ? scoreWords(cleaned, words.strong) + scoreWords(cleaned, words.weak ?? [], 0.5) : 0;
    // Saying the category or job by its own name always counts.
    if (has(cleaned, category.name.toLowerCase())) score += 2;

    let bestService: SubService | null = null;
    let bestServiceScore = 0;
    for (const service of category.services) {
      let s = scoreWords(cleaned, SERVICE_WORDS[`${category.slug}/${service.slug}`] ?? []);
      if (cleaned.includes(clean(service.name))) s += 3;
      if (s > bestServiceScore) {
        bestService = service;
        bestServiceScore = s;
      }
    }
    score += bestServiceScore;

    if (score > 0 && (!best || score > best.score)) {
      best = { category, service: bestService, score };
    }
  }

  return best ? { category: best.category, service: best.service } : { category: null, service: null };
}

/* ---- Details that can be picked out of any sentence ---- */

/**
 * A UK postcode, however it was said: "SW1A 1AA", "s w one a one a a".
 * Returned in the standard written form, "SW1A 1AA".
 */
export function findPostcode(text: string): string | null {
  const tokens = text
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => DIGIT_SOUNDS[t.toLowerCase()] ?? t);

  for (let start = 0; start < tokens.length; start++) {
    let joined = "";
    for (let end = start; end < tokens.length && end < start + 8; end++) {
      if (tokens[end].length > 4) break;
      joined += tokens[end];
      if (joined.length >= 5 && joined.length <= 7 && POSTCODE.test(joined)) {
        return `${joined.slice(0, -3)} ${joined.slice(-3)}`;
      }
    }
  }
  return null;
}

/** "tomorrow", "friday", "the day after tomorrow", as one of the offered days. */
export function findDay(text: string, days: Day[]): Day | null {
  const cleaned = clean(text);
  if (has(cleaned, "day after tomorrow")) return days[2] ?? null;
  if (has(cleaned, "today") || has(cleaned, "tonight") || has(cleaned, "this morning") || has(cleaned, "this afternoon") || has(cleaned, "this evening")) {
    return days[0] ?? null;
  }
  if (has(cleaned, "tomorrow")) return days[1] ?? null;
  // Today is never matched by weekday name: "friday" said on a Friday almost
  // always means next Friday, which is not offered.
  return days.slice(1).find((d) => has(cleaned, d.weekday)) ?? null;
}

export function findSlot(text: string): SlotId | null {
  const cleaned = clean(text);
  if (hasAny(cleaned, ["morning", "am", "early", "before lunch", "this morning"])) return "morning";
  if (hasAny(cleaned, ["afternoon", "after lunch", "lunchtime", "midday", "pm"])) return "afternoon";
  if (hasAny(cleaned, ["evening", "tonight", "night", "after work", "after 5"])) return "evening";
  return null;
}

export function findSize(text: string): TaskSize | null {
  const cleaned = clean(text);
  if (hasAny(cleaned, ["small", "quick", "little", "tiny", "an hour", "1 hour", "one hour", "short"])) return "small";
  if (hasAny(cleaned, ["medium", "couple of hours", "few hours", "2 hours", "two hours", "3 hours", "three hours", "half a day", "middle"])) return "medium";
  if (hasAny(cleaned, ["large", "big", "huge", "all day", "whole day", "full day", "4 hours", "four hours", "long"])) return "large";
  return null;
}

/** Pick one of a question's written options from a spoken answer. */
export function findOption(text: string, options: string[]): string | null {
  const cleaned = clean(text)
    .split(" ")
    .map((w) => NUMBER_WORDS[w] ?? w)
    .join(" ");
  const saidNumber = Number(cleaned.match(/ (\d+) /)?.[1] ?? NaN);

  let best: string | null = null;
  let bestScore = 0;
  for (const option of options) {
    const optionClean = clean(option);
    if (cleaned.includes(optionClean)) return option;

    let score = optionClean
      .trim()
      .split(" ")
      .filter((w) => w.length > 1 && !["or", "no", "a", "an", "just"].includes(w) && has(cleaned, w)).length;

    // Numbers: "2" matches "2 to 3 items"; "6" matches "4 or more".
    const nums = (optionClean.match(/\d+/g) ?? []).map(Number);
    if (!Number.isNaN(saidNumber) && nums.length) {
      const [low, high] = nums;
      const inRange = has(optionClean, "or more")
        ? saidNumber >= low
        : high !== undefined
          ? saidNumber >= low && saidNumber <= high
          : saidNumber === low;
      if (inRange) score += 2;
    }

    if (score > bestScore) {
      best = option;
      bestScore = score;
    }
  }
  if (best) return best;
  if (hasAny(cleaned, ["don't know", "dont know", "no idea", "unsure"])) {
    return options.find((o) => /not sure/i.test(o)) ?? null;
  }
  return null;
}

/** Which of a spoken list someone chose: "the second one", "two", or a name. */
export function findChoice<T>(text: string, items: T[], nameOf: (item: T) => string): T | null {
  const cleaned = clean(text);
  // Ordinal words first: "the second one" contains "one" too.
  const ordinals = [
    ["first", "1st"],
    ["second", "2nd"],
    ["third", "3rd"],
  ];
  const numbers = [
    ["one", "1"],
    ["two", "2"],
    ["three", "3"],
  ];
  for (const words of [ordinals, numbers]) {
    for (let i = 0; i < Math.min(items.length, words.length); i++) {
      if (hasAny(cleaned, words[i])) return items[i];
    }
  }
  return (
    items.find((item) => {
      const first = nameOf(item).toLowerCase().split(" ")[0];
      return has(cleaned, first);
    }) ?? null
  );
}

/* ---- Contact details ---- */

/** "jo dot smith at gmail dot com" as "jo.smith@gmail.com". */
export function spokenEmail(text: string): string {
  return ` ${text.toLowerCase()} `
    .replace(/\s+(at|at sign)\s+/g, "@")
    .replace(/\s+(dot|full stop|period|point)\s+/g, ".")
    .replace(/\s+(underscore)\s+/g, "_")
    .replace(/\s+(dash|hyphen|minus)\s+/g, "-")
    .replace(/^\s*(my email( address)? is|it's|it is|email)\s+/, "")
    .replace(/\s+/g, "")
    .replace(/\.$/, "");
}

/** Spelt out for reading back, so a wrong letter can be heard. */
export function spellOut(value: string): string {
  return value
    .split("")
    .map((c) => (c === "@" ? "at" : c === "." ? "dot" : c === "_" ? "underscore" : c === "-" ? "dash" : c))
    .join(" ");
}

export function spokenName(text: string): string {
  return text
    .trim()
    .replace(/^(my name is|my name's|i am|i'm|it's|it is|this is|call me)\s+/i, "")
    .replace(/[.!?]+$/, "")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Digits from a spoken phone number: "oh seven seven double two..." */
export function spokenPhone(text: string): string {
  const words = text.toLowerCase().replace(/[^a-z0-9+ ]+/g, " ").split(/\s+/);
  let out = "";
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const repeat = w === "double" ? 2 : w === "triple" ? 3 : 1;
    const target = repeat > 1 ? words[++i] ?? "" : w;
    const digit = /^\+?\d+$/.test(target) ? target : DIGIT_SOUNDS[target] ?? "";
    out += digit.repeat(repeat);
  }
  return out;
}

/* ---- Conversation words ---- */

export function isYes(text: string): boolean {
  return hasAny(clean(text), [
    "yes", "yeah", "yep", "yup", "correct", "right", "that's right", "thats right", "sure", "ok", "okay",
    "confirm", "continue", "go ahead", "please do", "do it", "sounds good", "perfect", "fine", "next",
  ]);
}

export function isNo(text: string): boolean {
  return hasAny(clean(text), ["no", "nope", "wrong", "not right", "incorrect", "don't", "do not", "nah"]);
}

export function isSkip(text: string): boolean {
  return hasAny(clean(text), ["skip", "no", "nothing", "none", "nope", "no thanks", "not needed", "leave it"]);
}

export function isStop(text: string): boolean {
  return /^\s*(please )?(stop|cancel|quit|exit|end|finish)( (it|now|please|voice|listening|talking))*\s*$/i.test(text);
}

export function isRepeat(text: string): boolean {
  return hasAny(clean(text), ["repeat", "say that again", "again", "pardon", "what", "sorry"]);
}

export function isBack(text: string): boolean {
  return hasAny(clean(text), ["go back", "back", "previous"]);
}

/* ---- One whole request ---- */

export interface BookingRequest {
  category: ServiceCategory | null;
  service: SubService | null;
  /** Answers the booking flow can start with. */
  answers: Partial<Draft>;
}

/**
 * Everything that can be understood from one free sentence such as "I need an
 * electrician, my sockets keep tripping, SW1A 1AA, tomorrow morning".
 */
export function understandRequest(text: string, days: Day[]): BookingRequest {
  const { category, service } = matchService(text);
  const answers: Partial<Draft> = { details: text.trim() };

  const postcode = findPostcode(text);
  if (postcode) answers.postcode = postcode;
  const day = findDay(text, days);
  if (day) answers.date = day.iso;
  const slot = findSlot(text);
  if (slot) answers.slot = slot;
  const size = findSize(text);
  if (size) answers.size = size;
  if (category?.question) {
    const option = findOption(text, category.question.options);
    // Only numbers or exact option words count here; a free sentence is full
    // of words that would otherwise match by accident.
    if (option && clean(text).includes(clean(option))) answers.answer = option;
  }

  return { category, service, answers };
}

