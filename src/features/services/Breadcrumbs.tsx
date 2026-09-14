import Link from "next/link";

/**
 * Where-am-I trail for the service and booking pages. A real navigation
 * landmark with an ordered list, the current page marked with aria-current,
 * so a screen reader hears the path rather than a row of loose links.
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
    </nav>
  );
}
