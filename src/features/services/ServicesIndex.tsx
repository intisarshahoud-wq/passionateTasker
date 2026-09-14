import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import {
  SERVICE_CATEGORIES,
  TRENDING,
  bookingHref,
  categoryHref,
  fromPriceOf,
} from "@/data/services";
import { Breadcrumbs } from "./Breadcrumbs";

/** Every service on one page: the categories, then the jobs trending right now. */
export function ServicesIndex() {
  return (
    <section className="svc-page">
      <div className="wrap">
        <Breadcrumbs trail={[{ href: "/", label: "Home" }]} current="Services" />

        <div className="section-head">
          <h1 className="svc-index__title">All services</h1>
          <p>
            Choose a service to see every job in it, with a starting price for each. Every
            tradesperson is ID-checked and insured before they can take work.
          </p>
        </div>

        <ul className="svc-index">
          {SERVICE_CATEGORIES.map((category) => (
            <li key={category.slug}>
              <article className="svc-card svc-card--category">
                <span className="svc-card__icon" aria-hidden="true">
                  <Icon name={category.icon} />
                </span>
                <h2 className="svc-card__title">
                  <Link className="svc-card__link" href={categoryHref(category.slug)}>
                    {category.name}
                  </Link>
                </h2>
                <p className="svc-card__summary">{category.tagline}</p>
                <p className="svc-card__price">
                  {category.services.length} jobs · from <strong>£{fromPriceOf(category)}</strong>{" "}
                  an hour
                </p>
              </article>
            </li>
          ))}
        </ul>

        <h2 className="svc-page__list-title">Trending right now</h2>
        <ul className="svc-chips">
          {TRENDING.map(({ category, service }) => (
            <li key={`${category.slug}-${service.slug}`}>
              <Link className="svc-chip" href={bookingHref(category.slug, service.slug)}>
                <span className="visually-hidden">Book </span>
                {service.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
