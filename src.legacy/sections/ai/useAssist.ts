import React from "react";
import { aiAssist, type AssistResult } from "../../lib/aiClient";
import { useAISettings } from "../../state/ai";
import { useAIContext } from "../../state/aiContext";

export function useAssist() {
  const { ai } = useAISettings();
  const aiCtx = useAIContext();
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
      // Track token usage with fallback estimation
      const tokens = res?.usage?.total_tokens ?? res?.usage?.totalTokens ?? 0;
      const estTokens = tokens > 0 ? tokens : Math.ceil((res?.text?.length ?? 0) / 4); // ~4 chars ? 1 token
      if (estTokens > 0) {
        aiCtx.addTokens(estTokens);
      }
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
      // Track token usage with fallback estimation
      const tokens = res?.usage?.total_tokens ?? res?.usage?.totalTokens ?? 0;
      const estTokens = tokens > 0 ? tokens : Math.ceil((res?.text?.length ?? 0) / 4); // ~4 chars ? 1 token
      if (estTokens > 0) {
        aiCtx.addTokens(estTokens);
      }
      // Set active context if ideaId or journalId present in vars
      if (vars.ideaId || vars.journalId) {
        aiCtx.setActive(vars.ideaId, vars.journalId);
      }
      window.dispatchEvent(new CustomEvent("token:observe", { detail: { text: JSON.stringify(vars).slice(0,4000) + (res?.text ?? "") }}));
      return res;
    } finally { setLoading(false); }
  };
  return { loading, result, run, runTemplate };
}
