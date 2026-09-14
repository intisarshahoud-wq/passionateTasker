/**
 * The service catalogue: every category, and every bookable job inside it.
 *
 * This is the single source for services. The landing page's service browser,
 * the /services pages, the booking flow, the hero search, the chat assistant
 * and the footer all read from here, so adding a job is one edit.
 *
 * Mock data for the frontend prototype. The shape is what a real catalogue API
 * would return (slugs, numeric prices), so pointing the pages at live data
 * later is a data change, not a redesign.
 *
 * Prices are indicative hourly starting rates in GBP for typical UK jobs, shown
 * so people can budget. The tradesperson confirms the real price before work.
 */

import { UNSPLASH, type Availability, type Category, type IconName } from "./marketplace";

export type TaskSize = "small" | "medium" | "large";

export const TASK_SIZES: { id: TaskSize; label: string; hours: number; hint: string }[] = [
  { id: "small", label: "Small", hours: 1, hint: "About 1 hour" },
  { id: "medium", label: "Medium", hours: 2.5, hint: "2 to 3 hours" },
  { id: "large", label: "Large", hours: 4, hint: "4 hours or more" },
];

export interface SubService {
  slug: string;
  name: string;
  summary: string;
  /** Indicative hourly starting rate, GBP. */
  fromPrice: number;
  /** Shown in the Trending tab and the hero's quick links. */
  trending?: boolean;
}

/** One extra question the booking flow asks for this category. */
export interface CategoryQuestion {
  label: string;
  options: string[];
}

export interface ServiceCategory {
  slug: string;
  name: string;
  icon: IconName;
  tagline: string;
  highlights: string[];
  /** Unsplash photo id. */
  photo: string;
  /** Describes the photo for anyone who cannot see it. */
  photoAlt: string;
  availability: Availability;
  question?: CategoryQuestion;
  /** A legal or safety point people should know before booking. */
  note?: string;
  services: SubService[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    slug: "assembly",
    name: "Assembly",
    icon: "tools",
    tagline: "Flat-pack furniture built properly, level, and fixed to the wall where it should be.",
    highlights: [
      "Beds, wardrobes, desks, cots and garden furniture, from box to finished.",
      "Tall units fixed to the wall so they cannot tip over.",
      "Packaging flattened and taken away if you ask.",
    ],
    photo: UNSPLASH.assembly,
    photoAlt: "A person fitting together a wooden shelving unit",
    availability: "live",
    question: { label: "How many items?", options: ["1 item", "2 to 3 items", "4 or more"] },
    services: [
      { slug: "furniture-assembly", name: "Furniture assembly", summary: "Any flat-pack piece, from a bedside table to a sofa bed.", fromPrice: 29, trending: true },
      { slug: "wardrobe-assembly", name: "Wardrobe assembly", summary: "Wardrobes built, doors hung and lined up straight.", fromPrice: 32 },
      { slug: "bed-assembly", name: "Bed assembly", summary: "Bed frames, bunk beds and storage beds, built and checked.", fromPrice: 29 },
      { slug: "desk-assembly", name: "Desk and office furniture", summary: "Desks, chairs and shelving for a home office.", fromPrice: 30 },
      { slug: "nursery-assembly", name: "Cot and nursery furniture", summary: "Cots, changing units and nursery storage, built to the instructions.", fromPrice: 30 },
      { slug: "garden-furniture-assembly", name: "Garden furniture assembly", summary: "Tables, benches and outdoor storage.", fromPrice: 32 },
    ],
  },
  {
    slug: "mounting",
    name: "Mounting",
    icon: "frame",
    tagline: "TVs, shelves, mirrors and blinds put up with the right fixings for your wall.",
    highlights: [
      "Your wall type checked first: plasterboard, brick or stone.",
      "Hidden cables and pipes found before anyone drills.",
      "Everything levelled, tested and tidied up afterwards.",
    ],
    photo: UNSPLASH.tvWall,
    photoAlt: "A living room with a flat-screen TV mounted on the wall",
    availability: "live",
    question: { label: "What kind of wall is it?", options: ["Plasterboard", "Brick or stone", "Not sure"] },
    services: [
      { slug: "tv-mounting", name: "TV mounting", summary: "Bracket fitted, screen levelled, cables tidied away.", fromPrice: 37, trending: true },
      { slug: "shelves", name: "Shelves", summary: "Floating or bracket shelves, straight and secure.", fromPrice: 35 },
      { slug: "pictures-mirrors", name: "Pictures and mirrors", summary: "Hung level, at the right height, with the right fixings.", fromPrice: 32 },
      { slug: "curtains-blinds", name: "Curtain poles and blinds", summary: "Poles, tracks and blinds fitted and working smoothly.", fromPrice: 33 },
      { slug: "wall-cabinets", name: "Wall cabinets", summary: "Bathroom and kitchen cabinets hung and levelled.", fromPrice: 38 },
    ],
  },
  {
    slug: "moving",
    name: "Moving",
    icon: "truck",
    tagline: "Help with the heavy lifting, whether it is a whole move or one awkward sofa.",
    highlights: [
      "Loading, unloading and carrying up and down stairs.",
      "Furniture wrapped and protected before it moves.",
      "Help with or without a vehicle, your choice.",
    ],
    photo: UNSPLASH.moving,
    photoAlt: "A person carrying cardboard moving boxes through a living room",
    availability: "live",
    question: { label: "Do you need a vehicle?", options: ["No, just help", "Yes, a car", "Yes, a van"] },
    note: "Taking rubbish or old furniture away needs a waste carrier registration by law. Anyone offering it here must hold one.",
    services: [
      { slug: "help-moving", name: "Help moving house", summary: "Extra hands for loading, unloading and carrying.", fromPrice: 35, trending: true },
      { slug: "heavy-lifting", name: "Heavy lifting", summary: "Furniture moved between rooms or up and down stairs.", fromPrice: 30 },
      { slug: "furniture-removal", name: "Furniture removal", summary: "Old furniture taken away and disposed of responsibly.", fromPrice: 38 },
      { slug: "packing", name: "Packing and unpacking", summary: "Boxes packed carefully and labelled room by room.", fromPrice: 28 },
      { slug: "rubbish-removal", name: "Rubbish removal", summary: "Garage, loft or garden waste cleared and taken to the tip.", fromPrice: 35 },
    ],
  },
  {
    slug: "cleaning",
    name: "Cleaning",
    icon: "sparkle",
    tagline: "Deep cleans, end-of-tenancy cleans and regular help, done thoroughly.",
    highlights: [
      "Kitchens, bathrooms and the corners that usually get missed.",
      "Products and equipment brought with them, unless you prefer your own.",
      "Book once, or the same day every week or fortnight.",
    ],
    photo: UNSPLASH.cleaning,
    photoAlt: "A cleaner in gloves vacuuming a grey footstool",
    availability: "live",
    question: { label: "How many bedrooms?", options: ["Studio or 1", "2", "3", "4 or more"] },
    services: [
      { slug: "deep-clean", name: "Deep clean", summary: "Top to bottom, including inside cupboards and appliances.", fromPrice: 25 },
      { slug: "end-of-tenancy", name: "End-of-tenancy clean", summary: "The clean a landlord's checklist expects.", fromPrice: 28, trending: true },
      { slug: "regular-clean", name: "Regular home clean", summary: "Weekly or fortnightly help keeping on top of things.", fromPrice: 22 },
      { slug: "oven-clean", name: "Oven clean", summary: "Oven, hob and extractor degreased.", fromPrice: 30 },
      { slug: "window-cleaning", name: "Window cleaning", summary: "Inside and out, frames and sills included.", fromPrice: 24 },
    ],
  },
  {
    slug: "outdoor-help",
    name: "Outdoor help",
    icon: "leaf",
    tagline: "Gardens tidied, hedges trimmed and outside spaces cleared.",
    highlights: [
      "Mowing, weeding and hedge trimming, with the clippings bagged up.",
      "Patios and paths jet-washed back to their original colour.",
      "One-off tidy-ups or regular visits through the season.",
    ],
    photo: UNSPLASH.garden,
    photoAlt: "A gardener trimming the edge of a lawn with a string trimmer",
    availability: "live",
    question: { label: "How big is the garden?", options: ["Small", "Medium", "Large"] },
    services: [
      { slug: "lawn-mowing", name: "Lawn mowing", summary: "Cut, edged and tidied.", fromPrice: 25 },
      { slug: "hedge-trimming", name: "Hedge trimming", summary: "Hedges shaped and cut back.", fromPrice: 28 },
      { slug: "garden-clearance", name: "Garden clearance", summary: "Overgrown gardens cut back and cleared.", fromPrice: 30, trending: true },
      { slug: "jet-washing", name: "Patio jet-washing", summary: "Patios, paths and driveways cleaned.", fromPrice: 30 },
      { slug: "gutter-clearing", name: "Gutter clearing", summary: "Gutters and downpipes cleared so rain drains away.", fromPrice: 35 },
    ],
  },
  {
    slug: "home-repairs",
    name: "Home repairs",
    icon: "wrench",
    tagline: "The small jobs that pile up: doors, drawers, grout and odd-jobs lists.",
    highlights: [
      "Bring a list: several small jobs done in one visit.",
      "Doors, locks, cupboards and drawers that stick or will not close.",
      "Sealant, grout and small wall repairs made good.",
    ],
    photo: UNSPLASH.repairs,
    photoAlt: "A hand using a screwdriver to fix a metal bracket to a wall",
    availability: "live",
    services: [
      { slug: "odd-jobs", name: "Odd-jobs list", summary: "Several small jobs done in one visit.", fromPrice: 35, trending: true },
      { slug: "doors-locks", name: "Doors and locks", summary: "Sticking doors eased, handles and latches replaced.", fromPrice: 35 },
      { slug: "cupboards-drawers", name: "Cupboards and drawers", summary: "Hinges adjusted, runners replaced, fronts realigned.", fromPrice: 33 },
      { slug: "sealant-grout", name: "Sealant and grout", summary: "Baths, showers and sinks resealed; tired grout renewed.", fromPrice: 32 },
      { slug: "wall-repairs", name: "Small wall repairs", summary: "Holes filled and patched, ready to paint.", fromPrice: 34 },
    ],
  },
  {
    slug: "painting",
    name: "Painting",
    icon: "brush",
    tagline: "Rooms, ceilings and woodwork painted neatly, with the furniture protected.",
    highlights: [
      "Furniture moved and floors covered before any paint goes on.",
      "Walls prepared properly: holes filled, cracks sealed, surfaces sanded.",
      "Clean, straight lines at the ceiling and skirting.",
    ],
    photo: UNSPLASH.painting,
    photoAlt: "A person painting a wall with a roller",
    availability: "live",
    question: { label: "How many rooms?", options: ["1 room", "2 to 3 rooms", "4 or more"] },
    services: [
      { slug: "room-painting", name: "Room painting", summary: "Walls painted in the colour you choose.", fromPrice: 32, trending: true },
      { slug: "ceiling-painting", name: "Ceiling painting", summary: "Ceilings refreshed, with stains sealed first.", fromPrice: 34 },
      { slug: "feature-wall", name: "Feature wall", summary: "One wall in a bold colour, or wallpapered.", fromPrice: 30 },
      { slug: "woodwork", name: "Skirting, doors and trim", summary: "Woodwork sanded and painted.", fromPrice: 32 },
      { slug: "fences-sheds", name: "Fences and sheds", summary: "Outdoor wood treated or painted.", fromPrice: 30 },
    ],
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    icon: "drop",
    tagline: "Leaks, blockages and fittings sorted by checked, insured plumbers.",
    highlights: [
      "Leaks, drips and blockages found and fixed.",
      "Taps, toilets, showers and radiators repaired or replaced.",
      "Washing machines and dishwashers plumbed in.",
    ],
    photo: UNSPLASH.pipes,
    photoAlt: "Exposed copper and steel pipework on a brick wall",
    availability: "live",
    note: "Boilers and anything involving gas must be done by a Gas Safe registered engineer by law. Gas work is not offered here yet.",
    services: [
      { slug: "leaking-tap", name: "Leaking tap", summary: "Dripping taps repaired or replaced.", fromPrice: 54 },
      { slug: "blocked-drain", name: "Blocked sink or drain", summary: "Sinks, baths and outside drains cleared and tested.", fromPrice: 65 },
      { slug: "toilet-repair", name: "Toilet repair", summary: "Running, leaking or wobbly toilets fixed.", fromPrice: 58 },
      { slug: "radiator-repair", name: "Radiator repair", summary: "Cold spots, leaks and valve replacements.", fromPrice: 60 },
      { slug: "appliance-plumbing", name: "Appliance plumbing", summary: "Washing machines and dishwashers connected.", fromPrice: 55 },
      { slug: "shower-repair", name: "Shower repair", summary: "Low pressure, leaks and mixer valves.", fromPrice: 60 },
    ],
  },
  {
    slug: "electrical",
    name: "Electrical",
    icon: "bolt",
    tagline: "Sockets, lights and faults handled by registered electricians.",
    highlights: [
      "Sockets, switches and light fittings replaced or added.",
      "Faults traced: tripping fuses, flickering lights, dead sockets.",
      "Work certified where the Building Regulations require it.",
    ],
    photo: UNSPLASH.wiring,
    photoAlt: "An electrician in a hard hat working on wall wiring",
    availability: "live",
    note: "New circuits, fuse boxes and work in bathrooms must be done by an electrician registered with a scheme such as NICEIC or NAPIT. We check the public register.",
    services: [
      { slug: "light-fitting", name: "Light fitting", summary: "Ceiling lights, spotlights and pendants fitted.", fromPrice: 60, trending: true },
      { slug: "sockets-switches", name: "Sockets and switches", summary: "Replaced, moved, or upgraded to USB sockets.", fromPrice: 60 },
      { slug: "fault-finding", name: "Fault finding", summary: "Tripping fuses and dead circuits traced and fixed.", fromPrice: 70 },
      { slug: "outdoor-lighting", name: "Outdoor lighting", summary: "Security and garden lights installed.", fromPrice: 65 },
      { slug: "smoke-alarms", name: "Smoke alarms", summary: "Mains or battery alarms fitted and tested.", fromPrice: 55 },
    ],
  },
];

/** The extra tab in the service browser, gathering the most-booked jobs. */
export const TRENDING_TAB = {
  slug: "trending",
  name: "Trending",
  icon: "trend" as IconName,
  highlights: [
    "The jobs people book most, from every service in one place.",
    "Each one shows a starting price before you commit to anything.",
    "Choose one to start booking straight away.",
  ],
  photo: UNSPLASH.drill,
  photoAlt: "A person drilling into wood with a cordless drill",
};

export const TRENDING: { category: ServiceCategory; service: SubService }[] =
  SERVICE_CATEGORIES.flatMap((category) =>
    category.services.filter((service) => service.trending).map((service) => ({ category, service }))
  );

export function getCategory(slug: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find((category) => category.slug === slug);
}

export function getService(
  categorySlug: string,
  serviceSlug: string
): { category: ServiceCategory; service: SubService } | undefined {
  const category = getCategory(categorySlug);
  const service = category?.services.find((s) => s.slug === serviceSlug);
  return category && service ? { category, service } : undefined;
}

/** The lowest starting rate in a category, for "from £X" labels. */
export function fromPriceOf(category: ServiceCategory): number {
  return Math.min(...category.services.map((service) => service.fromPrice));
}

export const categoryHref = (slug: string) => `/services/${slug}`;
export const bookingHref = (categorySlug: string, serviceSlug: string) =>
  `/book/${categorySlug}/${serviceSlug}`;

/**
 * The flat category shape the hero search, the chat assistant and the popular
 * jobs filter were built on, derived from the catalogue above so the two can
 * never disagree.
 */
export const CATEGORIES: Category[] = SERVICE_CATEGORIES.map((category, i) => ({
  id: `c${i + 1}`,
  slug: category.slug,
  name: category.name,
  tasks: category.services.map((service) => service.name),
  fromPrice: fromPriceOf(category),
  availability: category.availability,
  icon: category.icon,
}));
