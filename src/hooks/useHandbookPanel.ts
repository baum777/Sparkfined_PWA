import * as React from "react";
import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useLocation } from "react-router-dom";
import { getHandbookSpec } from "@/lib/handbook/specs";
import type { HandbookPageSpec, HandbookContext } from "@/lib/handbook/types";

interface HandbookPanelState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  spec: HandbookPageSpec | null;
  isLoading: boolean;
  error: string | null;
  context: HandbookContext;
}

const defaultContext: HandbookContext = {
  walletConnected: false,
  hasMonitoredWallet: false,
  hasHoldings: false,
  hasEntries: false,
  hasWatchlist: false,
  hasAlerts: false,
  isOffline: false,
  hasSelectedToken: false,
};

const HandbookPanelContext = createContext<HandbookPanelState | null>(null);

export function useHandbookPanel(): HandbookPanelState {
  const ctx = useContext(HandbookPanelContext);
  if (!ctx) {
    throw new Error("useHandbookPanel must be used within a HandbookPanelProvider");
  }
  return ctx;
}

function useHandbookPanelInternal(): HandbookPanelState {
  const [isOpen, setIsOpen] = useState(false);
  const [spec, setSpec] = useState<HandbookPageSpec | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedSpec = getHandbookSpec(location.pathname);
      setSpec(loadedSpec);
    } catch {
      setError("Failed to load handbook content");
      setSpec(null);
    } finally {
      setIsLoading(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const context = defaultContext;

  return { isOpen, open, close, toggle, spec, isLoading, error, context };
}

export function HandbookPanelProvider({ children }: { children: React.ReactNode }) {
  const state = useHandbookPanelInternal();
  return React.createElement(HandbookPanelContext.Provider, { value: state }, children);
}

export { HandbookPanelContext };
