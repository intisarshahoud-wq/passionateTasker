import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICE_CATEGORIES, getService } from "@/data/services";
import { BookingPage } from "@/features/booking/BookingPage";

// Every bookable job is known at build time; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_CATEGORIES.flatMap((category) =>
    category.services.map((service) => ({ category: category.slug, service: service.slug }))
  );
}

export async function generateMetadata(
  props: PageProps<"/book/[category]/[service]">
): Promise<Metadata> {
  const { category, service } = await props.params;
  const found = getService(category, service);
  if (!found) return {};
  return {
    title: `Book ${found.service.name} — Passionate Taskers`,
    description: found.service.summary,
  };
}

export default async function BookPage(props: PageProps<"/book/[category]/[service]">) {
  const { category, service } = await props.params;
  const found = getService(category, service);
  if (!found) notFound();
  return <BookingPage category={found.category} service={found.service} />;
}
