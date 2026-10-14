import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";
import { SERVICE_CATEGORIES, categoryHref } from "@/data/services";
import { SITE } from "@/lib/site";

/*
 * Only pages that exist. Privacy, terms and a contact page are written before
 * launch (milestone 01); until then a link to them would go nowhere.
 */
const COLUMNS = [
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/trust", label: "Trust and safety" },
      { href: "/accessibility", label: "Accessibility" },
      { href: "/#waitlist", label: "Join the waitlist" },
    ],
  },
  {
    heading: "For tradespeople",
    links: [
      { href: "/#pros", label: "Why join" },
      { href: "/trust#for-tradespeople", label: "Checks you will need to pass" },
      { href: "/#waitlist", label: "Sign up" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Link className="logo" href="/">
            <LogoMark size={28} />
            {SITE.name}
          </Link>
          <p className="footer-tagline">
            The voice-first way to find a tradesperson you can actually trust — built to be
            usable by everyone, including people the rest of the web forgot.
          </p>
        </div>

        <nav className="footer-col" aria-label="Services">
          <h2 className="footer-heading">Services</h2>
          <ul>
            {SERVICE_CATEGORIES.slice(0, 6).map((category) => (
              <li key={category.slug}>
                <Link href={categoryHref(category.slug)}>{category.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/services">All services</Link>
            </li>
          </ul>
        </nav>

        {COLUMNS.map((column) => (
          <nav className="footer-col" key={column.heading} aria-label={column.heading}>
            <h2 className="footer-heading">{column.heading}</h2>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="wrap footer-base">
        <p>© 2026 {SITE.name}. Built accessibility-first.</p>
        <p>
          Pre-launch design preview. Prices shown are indicative and no bookings can be made yet.
        </p>
      </div>
    </footer>
  );
}
