/**
 * Questions people ask before they trust a site like this, answered directly.
 *
 * Each answer starts with the answer. The same entries are shown on the home
 * page and given to search engines as structured data, so the two can never
 * disagree.
 *
 * Every answer has to be true today. We have not launched, and several answers
 * say so in their first sentence. Do not tidy that away.
 */

import { SITE } from "@/lib/site";
import { SERVICE_CATEGORIES } from "./services";

export interface FaqEntry {
  id: string;
  question: string;
  /** One paragraph per entry. Plain text: it is also read by search engines. */
  answer: string[];
  /** Where to read more. */
  link?: { href: string; label: string };
}

function list(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

const COUNT_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const countWord = (n: number) => COUNT_WORDS[n] ?? String(n);
const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const FAQS: FaqEntry[] = [
  {
    id: "open-yet",
    question: `Can I book a tradesperson through ${SITE.name} today?`,
    answer: [
      "Not yet. We have not launched. You can describe a job, look through every service and try each step of booking, but it is a preview: nothing is sent, nobody is booked and nobody will arrive.",
      "Booking will open area by area, once tradespeople there have passed our checks.",
    ],
  },
  {
    id: "cost",
    question: "How much does it cost?",
    answer: [
      "Every job shows an indicative starting price per hour, so you can budget before you speak to anyone. Your tradesperson confirms the real price with you before any work starts.",
      "Using the site is free for customers and for tradespeople during early access. There is no booking fee.",
    ],
    link: { href: "/services", label: "See every job and its starting price" },
  },
  {
    id: "checks",
    question: "How do you check tradespeople?",
    answer: [
      "Before anyone can take a job we verify their identity, check their public liability insurance and see a basic DBS check. Electricians doing work that has to be certified are looked up on their scheme’s public register.",
      "Each badge on a profile names one check and the date it was done. We have not opened yet, so no tradesperson has been through these checks so far.",
    ],
    link: { href: "/trust", label: "See what each badge means" },
  },
  {
    id: "without-typing",
    question: "Can I use the site without typing, or without seeing the screen?",
    answer: [
      "Yes. You can describe a job by speaking, and book one by voice from start to finish. Everything also works by keyboard alone and is built for screen readers. Voice needs a browser that supports it, such as Chrome or Edge.",
      "Larger text, light mode and high contrast are in the header of every page.",
    ],
    link: { href: "/accessibility", label: "Read about accessibility, including what does not work yet" },
  },
  {
    id: "paying",
    question: "How do I pay?",
    answer: [
      "When we open, you will pay your tradesperson directly, once you have agreed the price with them. We will not take or hold your money.",
      "Paying by card through the site, with bigger jobs paid in stages, is planned for later.",
    ],
    link: { href: "/how-it-works#paying", label: "More about paying" },
  },
  {
    id: "problems",
    question: "What happens if something goes wrong with a job?",
    answer: [
      "Talk to your tradesperson first. Everything you agreed is in one message thread, so there is a record of it.",
      "If that does not sort it out, you will be able to report the problem to us and a person will look into it. The full process will be published before we open.",
    ],
    link: { href: "/how-it-works#problems", label: "More about what happens if something goes wrong" },
  },
  {
    id: "jobs-covered",
    question: "Which jobs do you cover?",
    answer: [
      `${capitalise(countWord(SERVICE_CATEGORIES.length))} kinds of job: ${list(
        SERVICE_CATEGORIES.map((category) => category.name.toLowerCase())
      )}.`,
      "We do not offer gas or boiler work yet, because by law it has to be done by a Gas Safe registered engineer.",
    ],
    link: { href: "/services", label: "See all services" },
  },
  {
    id: "join-as-tradesperson",
    question: "I am a tradesperson. How do I join?",
    answer: [
      "Join the waiting list as a tradesperson. Before you can take jobs we will ask for photo ID, your public liability insurance certificate and a basic DBS check, plus your scheme registration if you are an electrician.",
      "Joining is free during early access: no subscription and no charge per lead.",
    ],
    link: { href: "/#waitlist", label: "Join the tradesperson waiting list" },
  },
];
