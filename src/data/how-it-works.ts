/**
 * How the service works, in the words the site uses for it.
 *
 * One source for the five steps (the landing page shows the short form, the
 * /how-it-works page the long one), for what we say about paying, and for the
 * staged-job example. The chat assistant reads the steps from here too.
 *
 * Everything here describes the first release unless it is marked as planned.
 * At the first release a job is one loop: post it, get matched, message, book.
 * No money moves through the site. Card payments and jobs split into stages
 * come later, and the copy says so every time they are mentioned.
 */

import type { IconName } from "./marketplace";

export interface JourneyStep {
  /** One or two words: the name of the step. */
  title: string;
  /** The landing page version: one or two short sentences. */
  summary: string;
  /** The /how-it-works version: a paragraph, then the points worth spelling out. */
  detail: string;
  points: string[];
}

export const JOURNEY: JourneyStep[] = [
  {
    title: "Tell us",
    summary:
      "Say it or type it in plain words. We turn it into a clear job post, and you check it before it goes anywhere.",
    detail:
      "Describe the job the way you would tell a neighbour: “my kitchen tap has been dripping since this morning”. We turn that into a job post with the kind of job, how urgent it is, and the details a tradesperson needs before they can quote.",
    points: [
      "Speak or type. Voice is never the only way, and neither is typing.",
      "You see the job post before anyone else does, and you can change any part of it.",
      "No account to create before you are allowed to ask.",
    ],
  },
  {
    title: "Match",
    summary:
      "We show you three tradespeople who do that job and cover your postcode, with the checks each one has passed.",
    detail:
      "You get a short list of three tradespeople who do that kind of job and cover your postcode, not ninety near-identical profiles to scroll through.",
    points: [
      "Each profile shows its hourly price, its reviews and how quickly it usually replies.",
      "Each badge says exactly what we checked, such as “Identity verified”.",
      "You choose. We never book anyone for you.",
    ],
  },
  {
    title: "Talk",
    summary:
      "Message them in one thread, by voice or by text. Agree the price and the time in writing.",
    detail:
      "You and your tradesperson message in one thread, by voice or by text. That is where you agree the price and the time, so both of you have it in writing.",
    points: [
      "No phone tag, and no chasing quotes across five different websites.",
      "Photos and details stay with the job, so nothing has to be explained twice.",
    ],
  },
  {
    title: "Track",
    summary:
      "See where the job stands at any moment: waiting for a reply, booked, or finished.",
    detail:
      "Your job always shows where it stands: waiting for a reply, booked, or finished. You should never have to guess, or ring someone to find out.",
    points: [
      "One page lists every job you have posted and what happens next on each.",
      "You are told when something changes, so you do not have to keep checking.",
    ],
  },
  {
    title: "Approve",
    summary:
      "When the work is done, you say so. Only a job that was really finished can be reviewed.",
    detail:
      "When the work is done, you and your tradesperson both mark the job as finished. Only then can a review be left, which is how we keep every review tied to a real job.",
    points: [
      "Nobody can review a tradesperson they did not hire through us.",
      "If the job is not right, say so before you approve it. See “If something goes wrong” below.",
    ],
  },
];

/* ---- Paying ---- */

export interface InfoPoint {
  icon: IconName;
  title: string;
  body: string;
}

export const PAYMENT_POINTS: InfoPoint[] = [
  {
    icon: "chat",
    title: "The price is agreed first",
    body: "Every job shows a starting price so you can budget. Your tradesperson confirms the real price in your message thread before any work begins.",
  },
  {
    icon: "card",
    title: "You pay your tradesperson directly",
    body: "When we open, you will pay your tradesperson yourself. We will not take, hold or move your money, and there is no booking fee during early access.",
  },
  {
    icon: "alert",
    title: "If something goes wrong",
    body: "Everything you agreed sits in one thread. If you cannot sort a problem out between you, you will be able to report it, and a person will look into it.",
  },
];

/** What we will and will not say about card payments, once they exist. */
export const CARD_PAYMENT_NOTE =
  "Paying by card through the site, with bigger jobs paid in stages, is planned for a later release. When it arrives we will say exactly what protection it gives you, in plain words, and we will not call it anything it is not.";

/* ---- If something goes wrong ---- */

export const PROBLEM_STEPS: { title: string; body: string }[] = [
  {
    title: "Start with your tradesperson",
    body: "Most problems are sorted out with a message. Everything you agreed is in one thread, so there is a record to point to.",
  },
  {
    title: "Then tell us",
    body: "If you cannot sort it out between you, you will be able to report the job to us. A person, not an automated reply, reads what was agreed and what happened.",
  },
  {
    title: "What we can do",
    body: "A tradesperson who does not meet our standards can be removed. The full process, with how long each step takes, will be published in our terms before we open for bookings.",
  },
];

/* ---- Jobs in stages (planned, not in the first release) ---- */

export const STAGE_POINTS: InfoPoint[] = [
  {
    icon: "list",
    title: "Agreed up front",
    body: "Each stage says what is included, when it is due and what finished looks like.",
  },
  {
    icon: "camera",
    title: "Shown, not just said",
    body: "Your tradesperson marks a stage as ready and adds photos of the work.",
  },
  {
    icon: "check",
    title: "Nothing moves on without you",
    body: "You approve the stage, or say what still needs doing.",
  },
];

export type StageState = "approved" | "ready" | "in-progress" | "not-started";

/** How each state is written on screen. Words first: never colour alone. */
export const STAGE_LABEL: Record<StageState, string> = {
  approved: "Approved",
  ready: "Ready for you to check",
  "in-progress": "In progress",
  "not-started": "Not started",
};

/**
 * An invented job, to show what a staged job will look like. Labelled as an
 * example wherever it is shown.
 */
export const STAGED_JOB_EXAMPLE: {
  title: string;
  stages: { name: string; state: StageState }[];
} = {
  title: "Painting a living room and hallway",
  stages: [
    { name: "Move furniture, cover floors, fill and sand", state: "approved" },
    { name: "Ceilings", state: "ready" },
    { name: "Walls, two coats", state: "in-progress" },
    { name: "Skirting, doors and trim", state: "not-started" },
  ],
};
