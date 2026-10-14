import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/data/marketplace";

/*
 * Each line has to be true of the site as it stands. "Complete" and "full" are
 * not words to use here until real people with real screen readers have been
 * through every page; what has and has not been tested is on /accessibility.
 */
const POINTS: { icon: IconName; label: string }[] = [
  { icon: "mic", label: "Book by voice from start to finish, not just voice search" },
  { icon: "keyboard", label: "Built for screen readers and for keyboard-only use, on every page" },
  { icon: "eye", label: "Larger text, light mode and high contrast, in the header of every page" },
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
            The display settings in the header are not a demo. The same{" "}
            <strong>larger text, light mode and high contrast</strong> ship in the product
            itself, on every screen.
          </p>
          <p className="section-more">
            <Link className="text-link" href="/accessibility">
              Read our mission and accessibility page, including what does not work yet
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
