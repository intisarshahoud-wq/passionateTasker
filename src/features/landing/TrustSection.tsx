import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { TRUST_POINTS } from "@/data/marketplace";

/**
 * Trust is the product, not a section — this is the answer to "am I safe
 * letting this person into my home", so it sits directly after discovery and
 * before any ask.
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
          {TRUST_POINTS.map((point) => (
            <RevealItem as="article" className="trust-card" key={point.title}>
              <span className="trust-card__icon" aria-hidden="true">
                <Icon name={point.icon} />
              </span>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <p className="section-note">
          Verification is carried out at sign-up and re-checked annually. We are pre-launch,
          so these are the standards we are building to, not claims about work already done.
        </p>
      </div>
    </section>
  );
}
