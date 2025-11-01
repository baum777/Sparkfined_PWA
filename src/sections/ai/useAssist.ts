import React from "react";
import { aiAssist, type AssistResult } from "../../lib/aiClient";
import { useAISettings } from "../../state/ai";

export function useAssist() {
  const { ai } = useAISettings();
  const [loading, setLoading] = React.useState(false);
  const [result, setResult]   = React.useState<AssistResult | null>(null);
  const run = async (system: string, user: string) => {
    setLoading(true);
    try {
      const res = await aiAssist({
        provider: ai.provider, model: ai.model, system, user,
        // hints/guards:
        ...(ai.maxOutputTokens ? { maxOutputTokens: ai.maxOutputTokens } : {}),
        ...(ai.maxCostUsd ? { maxCostUsd: ai.maxCostUsd } : {})
      });
      setResult(res);
      // broadcast for token overlay (approx if no server usage)
      const observed = `${system}\n\n${user}\n\n${res?.text ?? ""}`;
      window.dispatchEvent(new CustomEvent("token:observe", { detail: { text: observed }}));
      return res;
    } finally {
      setLoading(false);
    }
  };
  const runTemplate = async (templateId: "v1/analyze_bullets"|"v1/journal_condense", vars: Record<string,any>) => {
    setLoading(true);
    try{
      const res = await aiAssist({
        provider: ai.provider, model: ai.model,
        templateId, vars,
        ...(ai.maxOutputTokens ? { maxOutputTokens: ai.maxOutputTokens } : {}),
        ...(ai.maxCostUsd ? { maxCostUsd: ai.maxCostUsd } : {})
      });
      setResult(res);
      window.dispatchEvent(new CustomEvent("token:observe", { detail: { text: JSON.stringify(vars).slice(0,4000) + (res?.text ?? "") }}));
      return res;
    } finally { setLoading(false); }
  };
  return { loading, result, run, runTemplate };
}
