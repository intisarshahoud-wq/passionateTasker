import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbNode, jsonLd } from "@/lib/seo";

/**
 * Where-am-I trail for the service, booking and information pages. A real
 * navigation landmark with an ordered list, the current page marked with
 * aria-current, so a screen reader hears the path rather than a row of loose
 * links.
 *
 * The same trail is given to search engines as structured data, so a result
 * can show "Home > Services > Plumbing" instead of a bare address.
 */
export function Breadcrumbs({
  trail,
  current,
}: {
  trail: { href: string; label: string }[];
  current: string;
}) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {trail.map((crumb) => (
          <li key={crumb.href}>
            <Link href={crumb.href}>{crumb.label}</Link>
          </li>
        ))}
        <li aria-current="page">{current}</li>
      </ol>
      <JsonLd data={jsonLd(breadcrumbNode(trail, current))} />
    </nav>
  );
}
