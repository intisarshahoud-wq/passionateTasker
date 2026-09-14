import { categoryHref, type ServiceCategory, type SubService } from "@/data/services";
import { Breadcrumbs } from "@/features/services/Breadcrumbs";
import { BookingFlow } from "./BookingFlow";

/** The booking page shell: where you are, what you are booking, then the flow. */
export function BookingPage({
  category,
  service,
}: {
  category: ServiceCategory;
  service: SubService;
}) {
  return (
    <section className="booking-page">
      <div className="wrap">
        <Breadcrumbs
          trail={[
            { href: "/", label: "Home" },
            { href: "/services", label: "Services" },
            { href: categoryHref(category.slug), label: category.name },
          ]}
          current={service.name}
        />

        <header className="booking-page__head">
          <span className="section-tag">Book a tasker · {category.name}</span>
          <h1>{service.name}</h1>
          <p>{service.summary}</p>
        </header>

        <BookingFlow categorySlug={category.slug} serviceSlug={service.slug} />
      </div>
    </section>
  );
}
