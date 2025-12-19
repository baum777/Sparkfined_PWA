import React from "react";
import { JournalResultView } from "@/features/journal-v2/components/JournalResultView";
import type { JournalOutput } from "@/features/journal-v2/types";
import "./journal.css";

export interface JournalCardProps {
  result: JournalOutput;
}

export function JournalCard({ result }: JournalCardProps) {
  return (
    <section className="journal-shell__section" aria-label="Journal insights">
      <JournalResultView result={result} />
    </section>
  );
}
