"use client";

import Link from "next/link";
import { Button, Disclosure, DisclosureGroup, DisclosurePanel, Heading } from "react-aria-components";
import type { FaqEntry } from "@/data/faqs";

/**
 * A list of questions, each opening to show its answer.
 *
 * Built on React Aria's Disclosure, which gives the standard accordion
 * pattern: every question is a real heading holding a real button, the button
 * says whether it is expanded, and the answer is tied to it. A screen-reader
 * user can jump between questions by heading; a keyboard user opens one with
 * Enter or Space. Several can be open at once, so nothing closes behind you.
 *
 * The answers are in the page even while closed, so a browser's find-in-page
 * and a search engine both still see them.
 */
export function FaqList({
  items,
  headingLevel = 3,
}: {
  items: FaqEntry[];
  /** The level of each question's heading: one below the section's heading. */
  headingLevel?: 2 | 3 | 4;
}) {
  return (
    <DisclosureGroup className="faq" allowsMultipleExpanded>
      {items.map((item) => (
        <Disclosure key={item.id} id={item.id} className="faq__item">
          <Heading level={headingLevel} className="faq__heading">
            <Button slot="trigger" className="faq__trigger">
              <span className="faq__question">{item.question}</span>
              <svg
                className="faq__chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Button>
          </Heading>
          <DisclosurePanel className="faq__panel">
            <div className="faq__answer">
              {item.answer.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {item.link && (
                <p>
                  <Link className="text-link" href={item.link.href}>
                    {item.link.label}
                  </Link>
                </p>
              )}
            </div>
          </DisclosurePanel>
        </Disclosure>
      ))}
    </DisclosureGroup>
  );
}
