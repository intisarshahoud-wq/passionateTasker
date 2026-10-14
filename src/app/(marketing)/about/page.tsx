import type { Metadata } from "next";
import { AboutPage } from "@/features/info/AboutPage";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: `${SITE.name} is a new UK marketplace for finding a tradesperson, built for people who are blind, have low vision, are older or are less confident online. What it is, why it is being built, and where it stands today.`,
  path: "/about",
});

export default function Page() {
  return <AboutPage />;
}
