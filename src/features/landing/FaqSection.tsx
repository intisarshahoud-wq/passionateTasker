import { FaqList } from "@/components/ui/FaqList";
import { FAQS } from "@/data/faqs";

/**
 * The questions people ask before they trust a site like this.
 *
 * Near the end of the page on purpose: by here a visitor has seen what the
 * service is, and what is left are the doubts. The same entries are given to
 * search engines as structured data by the page (see app/(marketing)/page.tsx).
 */
export function FaqSection() {
  return (
    <section id="faq">
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">Questions</span>
          <h2>Questions people ask first</h2>
          <p>Straight answers, including the ones where the answer is “not yet”.</p>
        </div>

        <FaqList items={FAQS} />
      </div>
    </section>
  );
}
