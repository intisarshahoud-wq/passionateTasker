import type { JsonLdNode } from "@/lib/seo";

/**
 * Structured data for search engines and AI systems, as a JSON-LD script.
 *
 * It is data, not code, so it is a plain script tag rather than next/script.
 * The `<` is escaped so that no text inside the data can close the tag early.
 */
export function JsonLd({ data }: { data: JsonLdNode }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
