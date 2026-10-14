import type { Metadata } from "next";
import { HowItWorksPage } from "@/features/info/HowItWorksPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How it works, step by step",
  description:
    "Tell us what needs doing by voice or by text, choose from three tradespeople, agree the price in one message thread, and approve the work when it is done. Plus how paying works and what happens if something goes wrong.",
  path: "/how-it-works",
});

export default function Page() {
  return <HowItWorksPage />;
}
