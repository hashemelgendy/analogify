import type { Metadata } from "next";
import { HistoryPage } from "@/components/HistoryPage";

export const metadata: Metadata = {
  title: "Saved explanations — Anuminate",
  description:
    "Revisit analogies from your Anuminate learning trail.",
};

export default function HistoryRoute() {
  return <HistoryPage />;
}
