import React from "react";
import { getJSON, setJSON } from "@/lib/safeStorage";

export type AIProvider = "openai" | "anthropic" | "xai";
export type AISettings = {
  provider: AIProvider;
  model?: string;
  maxOutputTokens?: number;     // server hint
  maxCostUsd?: number;          // server guard
};
const KEY = "sparkfined.ai.settings.v1";
const DEFAULTS: AISettings = {
  provider: "anthropic",
  model: "claude-3-5-sonnet-latest",
  maxOutputTokens: 800,
  maxCostUsd: 0.15
};

function read(): AISettings {
  return getJSON(KEY, DEFAULTS);
}
function write(s: AISettings){ setJSON(KEY, s); }

type Ctx = { ai: AISettings; setAI: (p: Partial<AISettings>) => void };
const Ctx = React.createContext<Ctx | null>(null);

export function AIProviderState({ children }:{children:React.ReactNode}){
  const [ai, set] = React.useState<AISettings>(read);
  React.useEffect(()=>write(ai), [ai]);
  const setAI = (p: Partial<AISettings>) => set(s => ({ ...s, ...p }));
  return <Ctx.Provider value={{ ai, setAI }}>{children}</Ctx.Provider>;
}
export function useAISettings(){
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useAISettings must be used within AIProviderState");
  return ctx;
}
