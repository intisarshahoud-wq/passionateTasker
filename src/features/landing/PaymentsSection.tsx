import Link from "next/link";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { CARD_PAYMENT_NOTE, PAYMENT_POINTS } from "@/data/how-it-works";

/**
 * Money, and what happens when a job goes wrong.
 *
 * At the first release no money moves through the site, so nothing here may
 * suggest that a payment is held, protected or guaranteed by us. When card
 * payments exist, this section describes exactly what the payment provider and
 * our terms deliver, and no more.
 */
export function PaymentsSection() {
  return (
    <section id="paying">
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">Paying and problems</span>
          <h2>What you pay, and what happens if something goes wrong</h2>
          <p>No surprises, and no promises we cannot keep.</p>
        </div>

        <RevealGroup className="info-grid" stagger={0.07} amount={0.2}>
          {PAYMENT_POINTS.map((point) => (
            <RevealItem as="article" className="info-card" key={point.title}>
              <span className="info-card__icon" aria-hidden="true">
                <Icon name={point.icon} />
              </span>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <p className="section-note">{CARD_PAYMENT_NOTE}</p>

        <p className="section-more">
          <Link className="text-link" href="/how-it-works#paying">
            More about paying, and what to do if a job goes wrong
          </Link>
        </p>
      </div>
    </section>
  );
}
