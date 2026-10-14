import type { Metadata } from "next";
import { TrustPage } from "@/features/info/TrustPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Trust and safety: how we check tradespeople",
  description:
    "What each badge on a profile means: identity verified, public liability insurance checked, trade registration checked and basic DBS check seen. Who each check applies to, when it is repeated, and what we do not check.",
  path: "/trust",
});

export default function Page() {
  return <TrustPage />;
}
