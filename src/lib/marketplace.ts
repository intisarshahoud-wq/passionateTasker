/**
 * Mock marketplace data.
 *
 * Everything here is placeholder content for the frontend prototype — there is
 * no backend yet. The shapes are deliberately close to what a real API would
 * return (ids, slugs, numeric prices) so components can be pointed at live data
 * later without a rewrite.
 */

export type Availability = "live" | "soon";

export type IconName =
  | "drop"
  | "bolt"
  | "wrench"
  | "brush"
  | "leaf"
  | "sparkle"
  | "box"
  | "frame"
  | "shield"
  | "badge"
  | "mic"
  | "clock"
  | "chat"
  | "card"
  | "eye"
  | "keyboard"
  | "list";

export interface Category {
  id: string;
  slug: string;
  name: string;
  /** Concrete jobs a customer would recognise — task-first, not trade-first. */
  tasks: string[];
  /** Indicative hourly rate anchor, in GBP. */
  fromPrice: number;
  availability: Availability;
  icon: IconName;
}

export interface Project {
  id: string;
  title: string;
  categorySlug: string;
  /** Indicative price anchor, in GBP. */
  fromPrice: number;
  /** Typical time on site, human-readable. */
  duration: string;
  blurb: string;
  icon: IconName;
  /** Unsplash photo id — see UNSPLASH in this file. */
  photo: string;
  /** Describes the photo for anyone who cannot see it. */
  photoAlt: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
  service: string;
  /** Out of 5. */
  rating: number;
  /** Unsplash portrait id. */
  avatar: string;
}

export interface Step {
  title: string;
  body: string;
}

/**
 * Placeholder photography, by Unsplash photo id.
 *
 * Built as ids rather than full URLs so the size and quality parameters stay in
 * one place (see `unsplashUrl`), and so swapping in our own image storage later
 * is a change to one function instead of to every component.
 */
export const UNSPLASH = {
  heroTrades: "photo-1621905251189-08b45d6a269e",
  proAtWork: "photo-1503387762-592deb58ef4e",
  tap: "photo-1585704032915-c3400ca199e7",
  bathroom: "photo-1620626011761-996317b8d101",
  lighting: "photo-1513694203232-719a280e022f",
  wiring: "photo-1621905251189-08b45d6a269e",
  shelves: "photo-1556909212-d5b604d0c90d",
  livingRoom: "photo-1560448204-e02f11c3d0e2",
  interiorDoor: "photo-1524758631624-e2822e304c36",
  pipes: "photo-1607472586893-edb57bdc0e39",
} as const;

const PORTRAITS = {
  womanSmiling: "photo-1494790108377-be9c29b29330",
  olderMan: "photo-1472099645785-5658abf4ff4e",
  man: "photo-1507003211169-0a1dd7228f2d",
  womanRed: "photo-1544005313-94ddf0286df2",
  youngWoman: "photo-1438761681033-6461ffad8d80",
  youngMan: "photo-1500648767791-00dcc994a43e",
} as const;

/** Build a sized, compressed Unsplash URL from a photo id. */
export function unsplashUrl(id: string, width: number, height?: number) {
  const crop = height ? `&h=${height}&fit=crop&crop=entropy` : "&fit=crop";
  return `https://images.unsplash.com/${id}?w=${width}&q=72&auto=format${crop}`;
}

/**
 * Eight top-level categories, task-first. Only the three MVP trades are marked
 * live — the rest are honestly flagged as coming, rather than implying a
 * catalogue we cannot yet serve.
 */
export const CATEGORIES: Category[] = [
  {
    id: "c1",
    slug: "plumbing",
    name: "Plumbing",
    tasks: ["Fix a leaking tap", "Unblock a drain", "Replace a radiator", "Fit a new toilet"],
    fromPrice: 54,
    availability: "live",
    icon: "drop",
  },
  {
    id: "c2",
    slug: "electrical",
    name: "Electrical",
    tasks: ["Fit a light fitting", "Replace a socket", "Fault finding", "EICR safety check"],
    fromPrice: 60,
    availability: "live",
    icon: "bolt",
  },
  {
    id: "c3",
    slug: "handyman",
    name: "Handyman",
    tasks: ["Hang shelves", "Fix a sticking door", "Odd jobs list", "Fit a curtain pole"],
    fromPrice: 35,
    availability: "live",
    icon: "wrench",
  },
  {
    id: "c4",
    slug: "mounting",
    name: "Mounting",
    tasks: ["Mount a TV", "Hang pictures", "Put up a mirror", "Wall-mount a shelf"],
    fromPrice: 37,
    availability: "soon",
    icon: "frame",
  },
  {
    id: "c5",
    slug: "assembly",
    name: "Assembly",
    tasks: ["Flat-pack furniture", "Assemble a bed", "Build a wardrobe", "Office desk"],
    fromPrice: 29,
    availability: "soon",
    icon: "box",
  },
  {
    id: "c6",
    slug: "decorating",
    name: "Painting and decorating",
    tasks: ["Paint a room", "Wallpaper a wall", "Touch-up work", "Skirting and trim"],
    fromPrice: 32,
    availability: "soon",
    icon: "brush",
  },
  {
    id: "c7",
    slug: "gardening",
    name: "Gardening and outdoor",
    tasks: ["Mow and tidy", "Hedge trimming", "Jet-wash a patio", "Fence repair"],
    fromPrice: 30,
    availability: "soon",
    icon: "leaf",
  },
  {
    id: "c8",
    slug: "cleaning",
    name: "Cleaning",
    tasks: ["End of tenancy", "Deep clean", "Oven clean", "Regular housekeeping"],
    fromPrice: 25,
    availability: "soon",
    icon: "sparkle",
  },
];

/** Popular concrete jobs — the price-anchor cards. */
export const POPULAR_PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Fix a leaking tap",
    categorySlug: "plumbing",
    fromPrice: 54,
    duration: "About 1 hour",
    blurb: "Washer, cartridge or full replacement, diagnosed on the spot.",
    icon: "drop",
    photo: UNSPLASH.tap,
    photoAlt: "Close-up of a chrome kitchen tap over a sink"
  },
  {
    id: "p2",
    title: "Unblock a sink or drain",
    categorySlug: "plumbing",
    fromPrice: 65,
    duration: "1 to 2 hours",
    blurb: "Kitchen, bathroom or outside gully, cleared and tested.",
    icon: "drop",
    photo: UNSPLASH.bathroom,
    photoAlt: "A clean modern bathroom basin"
  },
  {
    id: "p3",
    title: "Fit a light fitting",
    categorySlug: "electrical",
    fromPrice: 60,
    duration: "About 1 hour",
    blurb: "Ceiling lights, spots and outdoor fittings, safely certified.",
    icon: "bolt",
    photo: UNSPLASH.lighting,
    photoAlt: "A living room corner lit by a floor lamp"
  },
  {
    id: "p4",
    title: "Replace a socket or switch",
    categorySlug: "electrical",
    fromPrice: 60,
    duration: "30 to 60 minutes",
    blurb: "Like-for-like swaps, USB sockets and dimmer upgrades.",
    icon: "bolt",
    photo: UNSPLASH.wiring,
    photoAlt: "An electrician in a hard hat working on wall wiring"
  },
  {
    id: "p5",
    title: "Hang shelves or a mirror",
    categorySlug: "handyman",
    fromPrice: 35,
    duration: "About 1 hour",
    blurb: "Levelled and fixed with the right anchors for your wall type.",
    icon: "wrench",
    photo: UNSPLASH.shelves,
    photoAlt: "Open kitchen shelves holding crockery"
  },
  {
    id: "p6",
    title: "Mount a TV on the wall",
    categorySlug: "mounting",
    fromPrice: 37,
    duration: "1 to 2 hours",
    blurb: "Bracket fitted, cables tidied, screen levelled and tested.",
    icon: "frame",
    photo: UNSPLASH.livingRoom,
    photoAlt: "A bright living room with a sofa facing a wall"
  },
  {
    id: "p7",
    title: "Fix a sticking door",
    categorySlug: "handyman",
    fromPrice: 35,
    duration: "About 1 hour",
    blurb: "Planing, hinge adjustment and new latches where needed.",
    icon: "wrench",
    photo: UNSPLASH.interiorDoor,
    photoAlt: "A hallway leading into a furnished room"
  },
  {
    id: "p8",
    title: "Emergency call-out",
    categorySlug: "plumbing",
    fromPrice: 90,
    duration: "Same day",
    blurb: "Burst pipe, no heating, no power. Flagged urgent and matched first.",
    icon: "clock",
    photo: UNSPLASH.pipes,
    photoAlt: "Exposed copper and steel pipework on a brick wall"
  },
];

/**
 * Search suggestions: the project titles plus phrasings people actually type,
 * so the hero search feels alive without a backend behind it.
 */
export const SEARCH_SUGGESTIONS: { id: string; label: string; categorySlug: string }[] = [
  ...POPULAR_PROJECTS.map((p) => ({
    id: `s-${p.id}`,
    label: p.title,
    categorySlug: p.categorySlug,
  })),
  { id: "s-9", label: "My boiler has stopped working", categorySlug: "plumbing" },
  { id: "s-10", label: "My kitchen tap is dripping", categorySlug: "plumbing" },
  { id: "s-11", label: "Radiator is cold at the top", categorySlug: "plumbing" },
  { id: "s-12", label: "A fuse keeps tripping", categorySlug: "electrical" },
  { id: "s-13", label: "Outdoor light not working", categorySlug: "electrical" },
  { id: "s-14", label: "Put up a curtain pole", categorySlug: "handyman" },
  { id: "s-15", label: "Assemble flat-pack furniture", categorySlug: "assembly" },
  { id: "s-16", label: "Paint a bedroom", categorySlug: "decorating" },
  { id: "s-17", label: "Trim an overgrown hedge", categorySlug: "gardening" },
  { id: "s-18", label: "End of tenancy clean", categorySlug: "cleaning" },
];

export const HOW_IT_WORKS: Step[] = [
  {
    title: "Describe the job",
    body: "Speak it or type it in plain words. The AI turns it into a clear job post: category, urgency, and the details a tradesperson actually needs before quoting.",
  },
  {
    title: "Get a shortlist",
    body: "We rank verified tradespeople nearby by rating, distance and availability, then show you three good matches instead of ninety near-identical profiles.",
  },
  {
    title: "Message and book",
    body: "Agree a time in one thread, by voice or by text. No phone tag, no chasing quotes across five different websites.",
  },
];

/**
 * Sample reviews.
 *
 * The product has not launched, so none of these are real customer reviews.
 * They are written as illustrations of the outcome we are designing for, and
 * the section that renders them says so in plain sight. That label is not
 * optional decoration: presenting invented reviews as genuine would undermine
 * the single thing this marketplace actually sells.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "I described the leak out loud while holding a towel under the sink. It wrote the job post for me and someone was booked in before lunch.",
    name: "Sarah M.",
    location: "Manchester",
    service: "Plumbing",
    rating: 5,
    avatar: PORTRAITS.womanSmiling,
  },
  {
    id: "t2",
    quote:
      "I have very little sight left. This is the first site of its kind I have got through on my own, without asking my daughter to do it for me.",
    name: "David R.",
    location: "Leeds",
    service: "Electrical",
    rating: 5,
    avatar: PORTRAITS.olderMan,
  },
  {
    id: "t3",
    quote:
      "The leads actually make sense. I know what the job is before I ring back, so I stop wasting half a day quoting work that goes nowhere.",
    name: "Marcus T.",
    location: "Birmingham",
    service: "Electrician",
    rating: 5,
    avatar: PORTRAITS.man,
  },
  {
    id: "t4",
    quote:
      "No forms, no drop-downs, no account before you are even allowed to ask. I said what was wrong and it worked out the rest.",
    name: "Priya K.",
    location: "Bristol",
    service: "Handyman",
    rating: 5,
    avatar: PORTRAITS.womanRed,
  },
  {
    id: "t5",
    quote:
      "Seeing the price before speaking to anybody is the part I care about. No awkward phone call to find out I cannot afford it.",
    name: "Chloe B.",
    location: "Glasgow",
    service: "Plumbing",
    rating: 5,
    avatar: PORTRAITS.youngWoman,
  },
  {
    id: "t6",
    quote:
      "Three matches, all checked, all nearby. I picked one and messaged them in the same window. That was the whole job done.",
    name: "Tom H.",
    location: "Sheffield",
    service: "Electrical",
    rating: 5,
    avatar: PORTRAITS.youngMan,
  },
];

export const TRUST_POINTS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "badge",
    title: "Identity and DBS checked",
    body: "Every tradesperson passes an ID check before they can take a single job, with an enhanced DBS check where the work involves vulnerable customers.",
  },
  {
    icon: "shield",
    title: "Trade bodies verified",
    body: "Gas Safe for gas work, NICEIC or NAPIT for electrical. We check the public register directly rather than trusting a badge on a website.",
  },
  {
    icon: "card",
    title: "Insured work, protected payment",
    body: "Public liability cover is confirmed on every profile, and payment is held until you confirm the job was done properly.",
  },
];
