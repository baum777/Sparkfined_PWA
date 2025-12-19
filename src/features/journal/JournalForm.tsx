import React from "react";
import { JournalInputForm } from "@/features/journal-v2/components/JournalInputForm";
import type { JournalInputFormHandle } from "@/features/journal-v2/components/JournalInputForm";
import type { JournalRawInput, TradeContext } from "@/features/journal-v2/types";
import "./journal.css";

export interface JournalFormProps {
  onSubmit: (input: JournalRawInput) => Promise<void> | void;
  isSubmitting?: boolean;
  tradeContext?: TradeContext;
  onClearTradeContext?: () => void;
}

export const JournalForm = React.forwardRef<JournalInputFormHandle, JournalFormProps>(function JournalForm(
  props,
  ref,
) {
  return (
    <section className="journal-shell__section" aria-label="Journal capture">
      <JournalInputForm ref={ref} {...props} />
    </section>
  );
});
