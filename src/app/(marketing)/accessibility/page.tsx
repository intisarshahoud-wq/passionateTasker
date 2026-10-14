import type { Metadata } from "next";
import { AccessibilityPage } from "@/features/info/AccessibilityPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Our mission and accessibility",
  description:
    "How the site works by voice, by keyboard and with a screen reader, how to change the text size and colours, the standard we are working to, and a plain list of what does not work yet.",
  path: "/accessibility",
});

export default function Page() {
  return <AccessibilityPage />;
}
