import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/data/marketplace";

const POINTS: { icon: IconName; label: string }[] = [
  { icon: "mic", label: "Full voice navigation, not just voice search" },
  { icon: "keyboard", label: "Complete screen reader and keyboard support" },
  { icon: "eye", label: "One-tap larger text and light mode — try them in the header now" },
  { icon: "list", label: "Simple, uncluttered layouts over feature-packed screens" },
];

/** The actual moat: the incumbents assume you can see the screen and type. */
export function AccessibilitySection() {
  return (
    <section id="accessibility">
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">Accessibility</span>
          <h2>Not a setting we added later</h2>
          <p>
            The big marketplaces were built for people who can see a screen and type quickly.
            We started from the assumption that plenty of customers cannot, or would simply
            rather not.
          </p>
        </div>

        <Reveal className="a11y-panel">
          <ul className="a11y-list">
            {POINTS.map((point) => (
              <li key={point.label}>
                <Icon name={point.icon} />
                {point.label}
              </li>
            ))}
          </ul>
          <p className="a11y-cta">
            Those two buttons in the header are not a demo. The same{" "}
            <strong>larger text and light mode</strong> ship in the product itself — one brand,
            two surfaces, whichever one you can read.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
