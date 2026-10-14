import type { MetadataRoute } from "next";
import { SERVICE_CATEGORIES, categoryHref } from "@/data/services";
import { absoluteUrl } from "@/lib/seo";

/**
 * sitemap.xml: the pages worth finding.
 *
 * The booking steps are left out on purpose (they are forms, not pages to land
 * on from a search). No "last modified" dates: we do not track them, and a
 * made-up date is worse than none.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "/", priority: 1 },
    { path: "/services", priority: 0.9 },
    ...SERVICE_CATEGORIES.map((category) => ({ path: categoryHref(category.slug), priority: 0.8 })),
    { path: "/how-it-works", priority: 0.7 },
    { path: "/trust", priority: 0.7 },
    { path: "/accessibility", priority: 0.7 },
    { path: "/about", priority: 0.5 },
  ];

  return pages.map(({ path, priority }) => ({ url: absoluteUrl(path), priority }));
}
