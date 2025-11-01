import React from "react";

export type AIProvider = "openai" | "anthropic" | "xai";
export type AISettings = {
  provider: AIProvider;
  model?: string;
};
const KEY = "sparkfined.ai.settings.v1";
const DEFAULTS: AISettings = { provider: "anthropic", model: "claude-3-5-sonnet-latest" };

function read(): AISettings {
  try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) || "{}")) }; }
  catch { return DEFAULTS; }
}
function write(s: AISettings){ localStorage.setItem(KEY, JSON.stringify(s)); }

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
