import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/ui/JsonLd";
import { SERVICE_CATEGORIES, categoryHref, getCategory } from "@/data/services";
import { CategoryView } from "@/features/services/CategoryView";
import { jsonLd, pageMetadata, serviceNode } from "@/lib/seo";

// Every category is known at build time; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata(props: PageProps<"/services/[category]">): Promise<Metadata> {
  const { category: slug } = await props.params;
  const category = getCategory(slug);
  if (!category) return {};
  return pageMetadata({
    title: `${category.name}: jobs and starting prices`,
    description: `${category.tagline} See every ${category.name.toLowerCase()} job and its indicative starting price.`,
    path: categoryHref(category.slug),
  });
}

export default async function CategoryPage(props: PageProps<"/services/[category]">) {
  const { category: slug } = await props.params;
  const category = getCategory(slug);
  if (!category) notFound();
  return (
    <>
      {/* What this service is, for search engines. No prices and no area
          served: the prices are indicative and we are not open anywhere yet. */}
      <JsonLd
        data={jsonLd(
          serviceNode({
            name: category.name,
            description: category.tagline,
            path: categoryHref(category.slug),
          })
        )}
      />
      <CategoryView category={category} />
    </>
  );
}
