/**
 * The chat assistant's brain.
 *
 * Deliberately a rule engine, not a model call: there is no backend yet, and a
 * visitor who cannot see the page should not be the one waiting on an API key.
 * The seam for the real thing is `respond()` — return the same `AssistantReply`
 * shape from a Claude call and the UI does not change.
 *
 * How answers are written here, and why:
 *
 * - **One short lead sentence, then at most three short points.** A listener
 *   holds about that much before the start of the answer is gone. The lead
 *   sentence alone has to be a usable answer on its own, in case the rest is
 *   interrupted.
 * - **No sentence longer than about twenty words**, and no clause stacking.
 * - **Nothing positional.** Never "the section above" or "the button on the
 *   right" — a listener has no above and no right.
 * - **Every answer ends with a way forward** — a question back, or a link.
 * - **Say when we do not know.** Guessing at what someone meant and answering
 *   confidently is worse than asking one short question.
 */

import { CATEGORIES } from "@/data/services";
import { structureJob, type StructuredJob } from "@/features/job-post/structure-job";

/** Something the assistant can do to the page itself, on request. */
export type AssistantAction =
  | "text-larger"
  | "text-normal"
  | "light-mode"
  | "dark-mode";

export interface AssistantReply {
  /** The lead sentence. Must stand alone as an answer. */
  text: string;
  /** At most three short follow-on points. Shown as a list, spoken in order. */
  points?: string[];
  /** Suggested next questions. Capped at three — more is a decision, not help. */
  chips: string[];
  job?: StructuredJob;
  action?: AssistantAction;
  /** A place on the page this answer relates to, offered as a link. */
  link?: { href: string; label: string };
}

/** Everything an answer says, as one plain string for the speech synthesiser. */
export function spokenForm(reply: AssistantReply): string {
  return [reply.text, ...(reply.points ?? [])].join(" ");
}

function list(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export const GREETING: AssistantReply = {
  text: "Hello. Tell me what needs fixing, in your own words.",
  points: [
    "For example: my kitchen tap has been leaking since this morning.",
    "I will turn that into a proper job post for you.",
    "You can speak instead of typing, and I can make the text larger.",
  ],
  chips: ["What does it cost?", "Which trades do you cover?", "Make the text larger"],
};

interface Rule {
  test: RegExp;
  reply: () => AssistantReply;
}

/**
 * Order matters. Page-control and question intents are matched before anything
 * else, because "can you make this bigger" contains no trade vocabulary and
 * would otherwise be filed as a handyman job.
 */
const RULES: Rule[] = [
  {
    test: /\b(bigger|larger|large text|big text|increase the (text|font)|hard to read|cannot read|can.t read|too small|zoom in)\b/i,
    reply: () => ({
      text: "Done. The text on the whole page is bigger now.",
      points: ["Say make the text normal to put it back."],
      chips: ["Switch to light mode", "Make the text normal", "What does it cost?"],
      action: "text-larger",
    }),
  },
  {
    test: /\b(normal text|smaller text|reset the text|text back|zoom out)\b/i,
    reply: () => ({
      text: "The text is back to its normal size.",
      chips: ["Make the text larger", "Switch to light mode", "How does this work?"],
      action: "text-normal",
    }),
  },
  {
    test: /\b(light mode|lighter|brighter|white background)\b/i,
    reply: () => ({
      text: "Switched to light mode: dark text on a light background.",
      points: ["Say dark mode to switch back."],
      chips: ["Make the text larger", "Switch to dark mode", "How does this work?"],
      action: "light-mode",
    }),
  },
  {
    test: /\b(dark mode|darker|night mode|black background)\b/i,
    reply: () => ({
      text: "Switched to dark mode.",
      chips: ["Make the text larger", "Switch to light mode", "How does this work?"],
      action: "dark-mode",
    }),
  },
  {
    test: /\b(blind|screen reader|voiceover|nvda|jaws|partially sighted|low vision|eyesight|eye sight|accessib|disab)/i,
    reply: () => ({
      text: "This site was built for people who cannot see it well, from the first day.",
      points: [
        "Everything works by keyboard alone, with no mouse.",
        "You can describe a job by speaking instead of typing.",
        "Ask me for larger text or light mode and I will change it for you.",
      ],
      chips: ["Make the text larger", "Switch to light mode", "Can I speak instead?"],
      link: { href: "/#accessibility", label: "Read the accessibility section" },
    }),
  },
  {
    test: /\b(speak|speaking|voice|talk|microphone|mic|dictat|read aloud|read it out|listen)/i,
    reply: () => ({
      text: "Yes. Press the microphone button and say what needs fixing.",
      points: [
        "I type out what you said, then answer.",
        "Turn on read aloud and I will speak every answer back to you.",
        "Stop stops me speaking straight away.",
      ],
      chips: ["What does it cost?", "How do you check tradespeople?", "Which trades do you cover?"],
    }),
  },
  {
    test: /\b(cost|costs|price|prices|pricing|charge|fee|how much|quote|expensive|cheap|rate)/i,
    reply: () => {
      const cheapest = [...CATEGORIES].sort((a, b) => a.fromPrice - b.fromPrice)[0];
      return {
        text: `Prices start at about £${cheapest.fromPrice} an hour, for ${cheapest.name.toLowerCase()}.`,
        points: [
          "Every trade shows a from-price and a typical time on site before you commit.",
          "Tell me the job and I will give you the price for that one.",
        ],
        chips: ["My boiler has no hot water", "Which trades do you cover?", "Is it safe?"],
        link: { href: "/#projects", label: "See typical jobs and prices" },
      };
    },
  },
  {
    test: /\b(trade|trades|category|categories|service|services|cover|coverage|do you do)\b/i,
    reply: () => ({
      text: `We cover ${CATEGORIES.length} kinds of job: ${list(CATEGORIES.map((c) => c.name.toLowerCase()))}.`,
      points: [
        "Every job shows a starting price, and booking takes four short steps.",
        "Tell me what needs doing and I will point you to the right one.",
      ],
      chips: ["What does it cost?", "How do you check tradespeople?", "Join the waiting list"],
      link: { href: "/services", label: "See all services" },
    }),
  },
  {
    test: /\b(safe|safety|trust|trusted|verified|verify|insured|insurance|dbs|background check|vetted|scam|qualified|licence|license|reliable)/i,
    reply: () => ({
      text: "Every tradesperson is identity-checked and background-checked before they can take work.",
      points: [
        "We verify their trade body registration and their public liability insurance.",
        "Your payment is held until you say the work is done.",
      ],
      chips: ["What does it cost?", "How does this work?", "Join the waiting list"],
      link: { href: "/#trust", label: "Read about trust and safety" },
    }),
  },
  {
    test: /\b(how does|how do|how it works|what happens|process|steps|explain|what is this|who are you|what do you do)\b/i,
    reply: () => ({
      text: "Three steps, and no forms at any point.",
      points: [
        "One: tell me what needs fixing, in ordinary words, by speaking or typing.",
        "Two: I write the job post and match it to checked tradespeople near you.",
        "Three: you get three good ones to choose from, not ninety.",
      ],
      chips: ["What does it cost?", "Is it safe?", "My kitchen tap is leaking"],
      link: { href: "/#how", label: "See how it works" },
    }),
  },
  {
    test: /\b(waitlist|waiting list|sign up|signup|register|join|early access|launch|when will|available yet|live yet)\b/i,
    reply: () => ({
      text: "We have not launched yet, so the way in is the waiting list.",
      points: [
        "It asks for your email and your postcode, and nothing else.",
        "You can join as a customer or as a tradesperson.",
      ],
      chips: ["What does it cost?", "Which trades do you cover?", "I am a tradesperson"],
      link: { href: "/#waitlist", label: "Go to the waiting list" },
    }),
  },
  {
    test: /\b(tradesperson|tradesman|trades person|i am a plumber|i am an electrician|my business|get work|leads|join as a pro)\b/i,
    reply: () => ({
      text: "For tradespeople: the leads reach you already described and already sorted.",
      points: [
        "You are not quoting blind or chasing jobs that were never yours.",
        "You can answer by voice while you are still on site.",
      ],
      chips: ["Join the waiting list", "How do you check tradespeople?", "What does it cost?"],
      link: { href: "/#pros", label: "Read the tradespeople section" },
    }),
  },
  {
    test: /\b(human|real person|phone|call you|email you|contact|support|complain|speak to someone)\b/i,
    reply: () => ({
      text: "There is no support line yet, because we have not launched.",
      points: [
        "Everything here is a working preview.",
        "Leave your email on the waiting list and a real person will contact you.",
      ],
      chips: ["Join the waiting list", "How does this work?", "Which trades do you cover?"],
      link: { href: "/#waitlist", label: "Go to the waiting list" },
    }),
  },
  {
    test: /^\s*(hi|hey|hello|hiya|good (morning|afternoon|evening)|are you there)\b/i,
    reply: () => GREETING,
  },
  {
    test: /\b(thanks|thank you|cheers|that is all|bye|goodbye)\b/i,
    reply: () => ({
      text: "You are very welcome.",
      points: ["I am here whenever you need me. Ask me anything, or describe another job."],
      chips: ["What does it cost?", "Which trades do you cover?", "Is it safe?"],
    }),
  },
];

/**
 * Does this read like someone describing a problem, rather than asking us
 * something? Only these get turned into a job post — guessing "handyman" at
 * three stray words is the single most confusing thing this assistant can do.
 */
const PROBLEM_WORDS =
  /\b(leak|leaking|broke|broken|break|fix|repair|replace|install|fit|fitted|blocked|block|not working|does not work|doesn.t work|stopped|stuck|damp|mould|crack|cracked|noise|noisy|smell|flood|burst|drip|dripping|no (hot water|heat|heating|power|light)|boiler|tap|toilet|sink|shower|drain|radiator|socket|switch|fuse|light|door|window|lock|shelf|fence|garden|hedge|lawn|paint|wall|ceiling|roof|gutter|floor|tile|clean|move|assemble|hang|mount)\b/i;

function looksLikeAProblem(text: string): boolean {
  const words = text.trim().split(/\s+/);
  return PROBLEM_WORDS.test(text) || words.length >= 6;
}

/** Spoken-first description of a structured job post. */
function jobReply(job: StructuredJob): AssistantReply {
  const priority =
    job.priority === "Same day"
      ? "It sounds urgent, so I have marked it same day."
      : "I have marked it as needed within a few days.";

  const matches = job.categoryLive
    ? `At launch, ${job.matches} checked tradespeople nearby could take it. Work like this starts at about £${job.fromPrice} an hour.`
    : "We are not covering that trade in your area yet. Telling us counts towards which trade we open next.";

  return {
    text: `Right. That is a ${job.category.toLowerCase()} job.`,
    points: [priority, matches, "Nothing has been sent anywhere. This is a preview."],
    job,
    chips: ["What does it cost?", "Is it safe?", "Join the waiting list"],
    link: { href: "/#waitlist", label: "Get matched at launch" },
  };
}

/** Said when we genuinely did not understand, instead of guessing. */
function clarify(): AssistantReply {
  return {
    text: "Sorry, I did not follow that.",
    points: [
      "Try telling me what is wrong, like: my shower has stopped working.",
      "Or ask me about prices, trades, safety checks, or how this works.",
    ],
    chips: ["What does it cost?", "How does this work?", "Which trades do you cover?"],
  };
}

export function respond(input: string): AssistantReply {
  const text = input.trim();
  if (!text) return GREETING;

  for (const rule of RULES) {
    if (rule.test.test(text)) return rule.reply();
  }

  return looksLikeAProblem(text) ? jobReply(structureJob(text)) : clarify();
}
