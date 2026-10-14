import type { Metadata } from "next";
import { ServicesIndex } from "@/features/services/ServicesIndex";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All services",
  description:
    "Assembly, mounting, moving, cleaning, outdoor help, home repairs, painting, plumbing and electrical work, from identity-verified and insured tradespeople. Every job shows an indicative starting price.",
  path: "/services",
});

export default function ServicesPage() {
  return <ServicesIndex />;
}
