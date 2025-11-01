import React from "react";

export type ThemeMode = "system" | "dark" | "light";
export type Settings = {
  theme: ThemeMode;
  snapDefault: boolean;
  replaySpeed: 1|2|4|8|10;
  showHud: boolean;
  showTimeline: boolean;
  showMinimap: boolean;
};

const KEY = "sparkfined.settings.v1";
const DEFAULTS: Settings = {
  theme: "system",
  snapDefault: true,
  replaySpeed: 2,
  showHud: true,
  showTimeline: true,
  showMinimap: true,
};

function read(): Settings {
  try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) || "{}")) }; }
  catch { return DEFAULTS; }
}
function write(s: Settings) { localStorage.setItem(KEY, JSON.stringify(s)); }

type Ctx = { settings: Settings; setSettings: (next: Partial<Settings>) => void };
const SettingsCtx = React.createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setState] = React.useState<Settings>(read);

  // persist
  React.useEffect(() => { write(settings); }, [settings]);

  // apply theme to <html>
  React.useEffect(() => {
    const root = document.documentElement;
    const apply = (mode: ThemeMode) => {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = mode === "dark" || (mode === "system" && prefersDark);
      root.classList.toggle("dark", !!dark);
    };
    apply(settings.theme);
    // react to system changes if theme=system
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => settings.theme === "system" && apply("system");
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [settings.theme]);

  const setSettings = (next: Partial<Settings>) => setState(s => ({ ...s, ...next }));

  return <SettingsCtx.Provider value={{ settings, setSettings }}>{children}</SettingsCtx.Provider>;
}

export function useSettings(): Ctx {
  const ctx = React.useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
