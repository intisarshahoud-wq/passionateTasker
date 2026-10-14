import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt: every page may be crawled, and the sitemap is where to start.
 *
 * The booking steps are kept out of search results by a "noindex" tag on those
 * pages rather than by blocking them here: a crawler that is blocked from a
 * page never sees the tag telling it not to list the page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
