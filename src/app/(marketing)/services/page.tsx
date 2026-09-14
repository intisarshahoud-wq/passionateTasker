import type { Metadata } from "next";
import { ServicesIndex } from "@/features/services/ServicesIndex";

export const metadata: Metadata = {
  title: "All services — Passionate Taskers",
  description:
    "Assembly, mounting, moving, cleaning, outdoor help, home repairs, painting, plumbing and electrical work, from ID-checked and insured tradespeople.",
};

export default function ServicesPage() {
  return <ServicesIndex />;
}
