/**
 * Facts about the site itself, in one place.
 *
 * The brand name appears in the header, the footer, every page title and the
 * structured data search engines read. Keeping it here means a rename is one
 * edit, not a search through the whole project.
 *
 * Safe to import anywhere, server or browser: nothing here reads the
 * environment. The site's address lives in `seo.ts`, which is server-side.
 */

interface Site {
  name: string;
  /** The line that says what we are trying to be. Shown above the hero headline. */
  positioning: string;
  /** What the service is, in one sentence, for pages with nothing more specific to say. */
  description: string;
  /** British English: spelling, currency, and the voice a screen reader picks. */
  lang: string;
  /**
   * Where people can write to us. Empty until a real inbox exists: the pages
   * that offer a contact route say plainly that there is not one yet, rather
   * than printing an address nobody reads. Set it here and they show it.
   */
  contactEmail: string;
}

export const SITE: Site = {
  name: "Passionate Taskers",
  positioning:
    "Building the world’s most accessible marketplace for tradespeople and customers.",
  description:
    "Describe the job in your own words, by voice or by text. We turn it into a proper job post and match you with identity-verified, insured tradespeople near you.",
  lang: "en-GB",
  contactEmail: "",
};
