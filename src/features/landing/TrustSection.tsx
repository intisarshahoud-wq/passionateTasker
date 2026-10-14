import Link from "next/link";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { CHECKS, PRELAUNCH_NOTE, RECHECK_NOTE } from "@/data/trust";

/**
 * Trust is the product, not a section — this is the answer to "am I safe
 * letting this person into my home", so it sits directly after discovery and
 * before any ask.
 *
 * Each card is one check, headed by the exact words of the badge a profile
 * will carry (data/trust.ts). No card says "trusted" or "verified" on its own.
 */
export function TrustSection() {
  return (
    <section id="trust">
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">Trust and safety</span>
          <h2>Checked before they ever knock on your door</h2>
          <p>
            You are letting a stranger into your home. Every check below happens before a
            tradesperson can accept a single job — not after something goes wrong.
          </p>
        </div>

        <RevealGroup className="trust-grid" stagger={0.07} amount={0.2}>
          {CHECKS.map((check) => (
            <RevealItem as="article" className="trust-card" key={check.id}>
              <span className="trust-card__icon" aria-hidden="true">
                <Icon name={check.icon} />
              </span>
              <h3>{check.badge}</h3>
              <p>{check.summary}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <p className="section-note">
          {RECHECK_NOTE} {PRELAUNCH_NOTE}
        </p>

        <p className="section-more">
          <Link className="text-link" href="/trust">
            See what each badge means, and what we do not check
          </Link>
        </p>
      </div>
    </section>
  );
}
