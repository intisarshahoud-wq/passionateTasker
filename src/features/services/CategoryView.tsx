import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { unsplashUrl } from "@/data/marketplace";
import { bookingHref, fromPriceOf, type ServiceCategory } from "@/data/services";
import { Breadcrumbs } from "./Breadcrumbs";

/**
 * One category's page: what it covers, what it costs, and every job in it,
 * each of which starts a booking.
 *
 * Each job card is a single link (the heading), stretched over the card with a
 * pseudo-element, so the whole card is a big hit target without nesting
 * interactive elements or making a screen reader announce a card-sized link.
 */
export function CategoryView({ category }: { category: ServiceCategory }) {
  return (
    <section className="svc-page">
      <div className="wrap">
        <Breadcrumbs
          trail={[
            { href: "/", label: "Home" },
            { href: "/services", label: "Services" },
          ]}
          current={category.name}
        />

        <header className="svc-page__head">
          <div className="svc-page__intro">
            <span className="svc-page__icon" aria-hidden="true">
              <Icon name={category.icon} />
            </span>
            <h1>{category.name}</h1>
            <p className="svc-page__tagline">{category.tagline}</p>
            <ul className="svc-feature__list">
              {category.highlights.map((line) => (
                <li key={line}>
                  <Icon name="check" className="svc-feature__tick" />
                  {line}
                </li>
              ))}
            </ul>
            <p className="svc-feature__price">
              Most jobs from <strong>£{fromPriceOf(category)}</strong> an hour. You see the
              estimate before you confirm anything.
            </p>
            {category.note && (
              <p className="svc-page__note">
                <Icon name="shield" className="svc-page__note-icon" />
                {category.note}
              </p>
            )}
          </div>
          <div className="svc-page__photo">
            <Image
              src={unsplashUrl(category.photo, 1000, 760)}
              alt={category.photoAlt}
              fill
              priority
              sizes="(max-width: 860px) 100vw, 45vw"
            />
          </div>
        </header>

        <h2 className="svc-page__list-title">Choose a job</h2>
        <ul className="svc-cards">
          {category.services.map((service) => (
            <li key={service.slug}>
              <article className="svc-card">
                <h3 className="svc-card__title">
                  <Link className="svc-card__link" href={bookingHref(category.slug, service.slug)}>
                    {service.name}
                  </Link>
                </h3>
                <p className="svc-card__summary">{service.summary}</p>
                <p className="svc-card__price">
                  From <strong>£{service.fromPrice}</strong> an hour
                </p>
                {service.trending && <span className="pill pill--live">Popular</span>}
                <span className="svc-card__cta" aria-hidden="true">
                  Book this job
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </article>
            </li>
          ))}
        </ul>

        <aside className="svc-page__help" aria-labelledby="svc-help-title">
          <h2 id="svc-help-title">Not sure which job it is?</h2>
          <p>
            Describe it in your own words, by voice or by text, and we will work out who is
            right for it.
          </p>
          <Link className="btn btn-outline" href="/#top">
            Describe your job instead
          </Link>
        </aside>
      </div>
    </section>
  );
}
