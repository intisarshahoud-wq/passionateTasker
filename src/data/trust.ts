/**
 * What we check about a tradesperson, and the exact words we use for it.
 *
 * One source for every place a check is mentioned: the hero strip, the trust
 * section, the /trust page, the sample profiles in booking and the chat
 * assistant. If the wording changes, it changes here and nowhere else.
 *
 * The rule behind the wording: a badge says what was checked. "Identity
 * verified" tells a customer something. "Trusted", "Approved" or "Verified" on
 * its own does not, so none of those appear anywhere on the site.
 *
 * We have not launched, and no tradesperson has been through these checks yet.
 * They are the standard every profile has to meet before it can take a job
 * (milestone 05), and every page that shows them says so.
 */

import type { IconName } from "./marketplace";

export type CheckId = "identity" | "insurance" | "registration" | "dbs";

export interface VerificationCheck {
  id: CheckId;
  /** The badge, exactly as it appears on a profile. */
  badge: string;
  icon: IconName;
  /** Who has to pass it. */
  appliesTo: string;
  /** One or two sentences, for the landing page. */
  summary: string;
  /** The fuller explanation, for the /trust page. One paragraph per entry. */
  detail: string[];
}

export const CHECKS: VerificationCheck[] = [
  {
    id: "identity",
    badge: "Identity verified",
    icon: "id",
    appliesTo: "Every tradesperson",
    summary:
      "Every tradesperson proves who they are before they can take a single job. The badge shows the date we checked.",
    detail: [
      "We ask for government-issued photo ID, such as a passport or a driving licence, and check it belongs to the person signing up.",
      "Nobody can take a job until this check has been passed.",
    ],
  },
  {
    id: "insurance",
    badge: "Public liability insurance checked",
    icon: "shield",
    appliesTo: "Every tradesperson",
    summary:
      "We see the insurance certificate itself: who the insurer is, how much it covers and the day it runs out.",
    detail: [
      "Public liability insurance is what pays if a tradesperson damages your home or injures someone while working.",
      "We record the insurer, the amount of cover and the expiry date from the certificate. When the cover runs out the badge comes off, and it stays off until we have seen the renewal.",
    ],
  },
  {
    id: "registration",
    badge: "Trade registration checked",
    icon: "clipboard",
    appliesTo: "Electricians doing work that has to be certified",
    summary:
      "Where the law asks for a registered tradesperson, we look them up on the public register ourselves, rather than trusting a logo on a van.",
    detail: [
      "Some electrical work, such as a new circuit or a new fuse box, has to be certified under the Building Regulations. For that work we only match electricians registered with a government-approved scheme such as NICEIC or NAPIT, and we look them up on the scheme’s own public register.",
      "The badge names the register, so you can look the electrician up yourself.",
      "Gas and boiler work is not offered yet. When it is, every engineer will be checked on the Gas Safe Register before they can take a job.",
    ],
  },
  {
    id: "dbs",
    badge: "Basic DBS check seen",
    icon: "document",
    appliesTo: "Every tradesperson",
    summary:
      "Every tradesperson gives us a basic criminal record check before they can take a job. The badge shows the date on the certificate.",
    detail: [
      "A basic DBS check shows any unspent criminal convictions. It is the level of check that anyone can be asked for.",
      "In Scotland the same check comes from Disclosure Scotland, and in Northern Ireland from AccessNI. The badge says which one we saw.",
      "A certificate is a record of one day, so the badge shows its date and we ask for a new one every year.",
    ],
  },
];

export function getCheck(id: CheckId): VerificationCheck {
  const check = CHECKS.find((c) => c.id === id);
  if (!check) throw new Error(`Unknown check: ${id}`);
  return check;
}

/** The badges a profile shows for one kind of work. */
export function badgesFor(categorySlug: string): string[] {
  const ids: CheckId[] = ["identity", "insurance", "dbs"];
  // Only electricians have a register the law points to. A plumber has none
  // while gas work is not offered, so that badge would be a claim about nothing.
  if (categorySlug === "electrical") ids.push("registration");
  return ids.map((id) => getCheck(id).badge);
}

/** When the checks happen. Said once, in the same words, wherever it is needed. */
export const RECHECK_NOTE =
  "Every check is done before a tradesperson can take their first job, again each year, and whenever a document runs out.";

/**
 * The honest status line. We are pre-launch: these are standards, not a record
 * of work already done.
 */
export const PRELAUNCH_NOTE =
  "We have not opened for bookings yet, so no tradesperson has been through these checks so far. They are the standard every profile has to meet before it can take a job.";
