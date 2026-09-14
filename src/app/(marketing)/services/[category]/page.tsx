import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICE_CATEGORIES, getCategory } from "@/data/services";
import { CategoryView } from "@/features/services/CategoryView";

// Every category is known at build time; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata(props: PageProps<"/services/[category]">): Promise<Metadata> {
  const { category: slug } = await props.params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: `${category.name} — Passionate Taskers`,
    description: category.tagline,
  };
}

export default async function CategoryPage(props: PageProps<"/services/[category]">) {
  const { category: slug } = await props.params;
  const category = getCategory(slug);
  if (!category) notFound();
  return <CategoryView category={category} />;
}
