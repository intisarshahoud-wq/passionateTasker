import { LogoMark } from "@/components/LogoMark";
import { CATEGORIES } from "@/lib/marketplace";

const COLUMNS = [
  {
    heading: "Company",
    links: [
      { href: "#how", label: "How it works" },
      { href: "#trust", label: "Trust and safety" },
      { href: "#accessibility", label: "Accessibility statement" },
      { href: "#waitlist", label: "Join the waitlist" },
    ],
  },
  {
    heading: "For tradespeople",
    links: [
      { href: "#pros", label: "Why join" },
      { href: "#trust", label: "Verification and checks" },
      { href: "#waitlist", label: "Sign up" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <a className="logo" href="#top">
            <LogoMark size={28} />
            Passionate Taskers
          </a>
          <p className="footer-tagline">
            The voice-first way to find a tradesperson you can actually trust — built to be
            usable by everyone, including people the rest of the web forgot.
          </p>
        </div>

        <nav className="footer-col" aria-label="Services">
          <h2 className="footer-heading">Services</h2>
          <ul>
            {CATEGORIES.slice(0, 5).map((category) => (
              <li key={category.id}>
                <a href="#categories">{category.name}</a>
              </li>
            ))}
          </ul>
        </nav>

        {COLUMNS.map((column) => (
          <nav className="footer-col" key={column.heading} aria-label={column.heading}>
            <h2 className="footer-heading">{column.heading}</h2>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="wrap footer-base">
        <p>© 2026 Passionate Taskers. Built accessibility-first.</p>
        <p>
          Pre-launch design preview. Prices shown are indicative and no bookings can be made yet.
        </p>
      </div>
    </footer>
  );
}
