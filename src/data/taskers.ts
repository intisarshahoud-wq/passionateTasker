/**
 * Sample tradespeople for the booking flow.
 *
 * NONE OF THESE PEOPLE EXIST. The product has not launched, so there are no
 * real tradespeople to show. These profiles let the booking flow be designed,
 * tested and reviewed, and every screen that shows them labels them as samples
 * in plain sight. That label is not optional: presenting invented tradespeople
 * as real would undermine the one thing this marketplace sells.
 *
 * They are shown with initials, not photographs, for the same reason: a face
 * makes an invented person look real.
 *
 * The shape is what a real matching API would return, so the flow can be
 * pointed at live data later without a rewrite. The three returned for a job
 * are deterministic, so a booking in progress survives a page refresh.
 */

import type { ServiceCategory, SubService } from "./services";

export interface Tasker {
  id: string;
  name: string;
  initials: string;
  /** Out of 5, one decimal place. */
  rating: number;
  reviews: number;
  jobsDone: number;
  hourlyRate: number;
  yearsExperience: number;
  responseTime: string;
  bio: string;
  badges: string[];
}

const PEOPLE = [
  { name: "Aisha K.", years: 8, response: "Usually replies within an hour" },
  { name: "Graham P.", years: 22, response: "Usually replies within 2 hours" },
  { name: "Daniel O.", years: 5, response: "Usually replies within 30 minutes" },
  { name: "Ngozi A.", years: 11, response: "Usually replies within an hour" },
  { name: "Marek N.", years: 14, response: "Usually replies within 3 hours" },
  { name: "Hannah W.", years: 6, response: "Usually replies within an hour" },
];

const BIOS = [
  "Tidy, on time, and happy to explain what I am doing as I go.",
  "I bring my own tools, protect your floors, and take the mess away with me.",
  "Patient and careful. I will always check the job with you before I leave.",
];

/** Small, stable string hash, so the same job always gets the same three people. */
function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

function badgesFor(category: ServiceCategory): string[] {
  const badges = ["ID checked", "Insured"];
  if (category.slug === "plumbing" || category.slug === "electrical") {
    badges.push("Trade registration checked");
  }
  return badges;
}

/** Three sample tradespeople for one job, shortlisted rather than a long list. */
export function taskersFor(category: ServiceCategory, service: SubService): Tasker[] {
  const seed = hash(`${category.slug}/${service.slug}`);
  const rates = [service.fromPrice + 8, service.fromPrice, service.fromPrice + 4];
  const ratings = [4.9, 4.8, 4.7];

  return [0, 1, 2].map((i) => {
    const person = PEOPLE[(seed + i * 2) % PEOPLE.length];
    return {
      id: `${category.slug}-${service.slug}-${i}`,
      name: person.name,
      initials: person.name
        .split(" ")
        .map((part) => part[0])
        .join(""),
      rating: ratings[i],
      reviews: 40 + ((seed >>> (i * 3)) % 160),
      jobsDone: 60 + ((seed >>> (i * 4 + 1)) % 300),
      hourlyRate: rates[i],
      yearsExperience: person.years,
      responseTime: person.response,
      bio: `${person.years} years of ${category.name.toLowerCase()} work. ${BIOS[(seed + i) % BIOS.length]}`,
      badges: badgesFor(category),
    };
  });
}
