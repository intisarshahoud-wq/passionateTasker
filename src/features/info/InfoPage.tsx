import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { Breadcrumbs } from "@/features/services/Breadcrumbs";

/**
 * The shell shared by the information pages: how it works, trust and safety,
 * accessibility, about.
 *
 * Every one of them opens the same way: where you are, the page's one purpose
 * as its heading, and a short answer straight underneath. Someone who reads
 * only that far should still leave with the point of the page.
 */
export function InfoPage({
  crumb,
  tag,
  title,
  lede,
  children,
}: {
  /** The page's name in the breadcrumb trail. */
  crumb: string;
  /** The small label above the heading. */
  tag?: string;
  title: string;
  lede: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="info-page">
      <div className="wrap">
        <Breadcrumbs trail={[{ href: "/", label: "Home" }]} current={crumb} />

        <header className="info-page__head">
          {tag && <span className="section-tag">{tag}</span>}
          <h1>{title}</h1>
          <p className="info-page__lede">{lede}</p>
        </header>

        {children}
      </div>
    </div>
  );
}

/** One titled part of an information page. `id` makes it linkable. */
export function InfoBlock({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="info-block" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/**
 * The plain statement of where things stand, shown near the top of a page that
 * describes something not open yet. Set apart with an edge and an icon, not
 * with colour alone.
 */
export function StatusNote({ children }: { children: ReactNode }) {
  return (
    <p className="info-note">
      <Icon name="clock" className="info-note__icon" />
      <span>{children}</span>
    </p>
  );
}
