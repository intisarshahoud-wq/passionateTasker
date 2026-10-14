/**
 * Search and sharing: page metadata and structured data, built in one place.
 *
 * Used only on the server (page metadata, the sitemap, robots.txt and the
 * JSON-LD scripts), so reading the environment here is safe.
 *
 * The rule for everything in this file: never tell a search engine more than
 * the page itself says. We have not launched, so there are no prices, ratings,
 * reviews or service areas in the structured data. Those go in when they are
 * real.
 */

import type { Metadata } from "next";
import { SITE } from "./site";

/**
 * The address the site is served from, without a trailing slash.
 *
 * Set NEXT_PUBLIC_SITE_URL when deploying. Without it, canonical links and the
 * sitemap would point at localhost, which is only right on this machine.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

/** A full address for a path on this site. The home page is the bare address. */
export function absoluteUrl(path = "/"): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/** The home page's title: the brand first, then the promise. */
export const HOME_TITLE = `${SITE.name} — Tell us what needs fixing`;

/**
 * Metadata for one page: its title, description, canonical address and the
 * card shown when the link is shared.
 *
 * `title` is the page's own name. The root layout adds the brand after it, so
 * pass "How it works", not "How it works | Passionate Taskers". The home page
 * is the exception: it passes `brandInTitle: false` because its title already
 * carries the brand.
 */
export function pageMetadata({
  title,
  description,
  path,
  index = true,
  brandInTitle = true,
}: {
  title: string;
  description: string;
  /** The page's path, starting with a slash. */
  path: string;
  /** False for pages that should stay out of search results, such as booking steps. */
  index?: boolean;
  /** False when the title is complete as written. */
  brandInTitle?: boolean;
}): Metadata {
  return {
    title: brandInTitle ? title : { absolute: title },
    description,
    alternates: { canonical: path },
    ...(index ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE.name,
      locale: "en_GB",
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

/* ---- Structured data (JSON-LD) ---- */

export type JsonLdNode = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Who runs the site. Referred to by id from the other nodes. */
export function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    url: SITE_URL,
    description: SITE.positioning,
  };
}

export function websiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE.name,
    url: SITE_URL,
    description: SITE.description,
    inLanguage: SITE.lang,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** One kind of service, for a category page. No price and no area: neither is real yet. */
export function serviceNode(service: { name: string; description: string; path: string }): JsonLdNode {
  return {
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.description,
    url: absoluteUrl(service.path),
    provider: { "@type": "Organization", "@id": ORGANIZATION_ID, name: SITE.name, url: SITE_URL },
  };
}

/** Questions and answers, for a page that shows the same ones on screen. */
export function faqNode(entries: { question: string; answer: string[] }[]): JsonLdNode {
  return {
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer.join(" ") },
    })),
  };
}

/** The where-am-I trail. The last item is the page itself, so it carries no link. */
export function breadcrumbNode(trail: { href: string; label: string }[], current: string): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      ...trail.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.label,
        item: absoluteUrl(crumb.href),
      })),
      { "@type": "ListItem", position: trail.length + 1, name: current },
    ],
  };
}

/** Wrap one node, or several as a graph, in the schema.org context. */
export function jsonLd(...nodes: JsonLdNode[]): JsonLdNode {
  return nodes.length === 1
    ? { "@context": "https://schema.org", ...nodes[0] }
    : { "@context": "https://schema.org", "@graph": nodes };
}
