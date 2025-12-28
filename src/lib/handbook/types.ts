// Handbook System Types

export interface HandbookCTA {
  label: string;
  action: string; // e.g., "nav:/route", "open:modal/name", "focus:fieldId"
}

export interface HandbookGate {
  condition: string; // e.g., "walletConnected", "hasEntries"
  hint?: string;
}

export interface HandbookStep {
  id: string;
  title: string;
  userAction: string;
  systemBehavior: string;
  outcome: string;
  cta?: HandbookCTA;
  gates?: HandbookGate[];
}

export interface HandbookBranch {
  when: string;
  steps: HandbookStep[];
}

export interface HandbookFlow {
  id: string;
  title: string;
  level: "basic" | "advanced";
  steps: HandbookStep[];
  branches?: HandbookBranch[];
}

export interface HandbookShortcut {
  keys: string;
  action: string;
}

export interface HandbookPitfall {
  problem: string;
  fix: string;
  cta?: HandbookCTA;
}

export interface HandbookGlossaryTerm {
  term: string;
  meaning: string;
}

export interface HandbookPrerequisite {
  id: string;
  label: string;
  gate: string; // condition to check
  hint?: string;
  cta?: HandbookCTA;
}

export interface HandbookPageSpec {
  id: string;
  route: string;
  title: string;
  purpose: string;
  prerequisites: HandbookPrerequisite[];
  flows: HandbookFlow[];
  shortcuts: HandbookShortcut[];
  pitfalls: HandbookPitfall[];
  glossary: HandbookGlossaryTerm[];
}

export interface HandbookIndex {
  routes: Record<string, string>; // route -> spec file name
}

// Context for gate evaluation
export interface HandbookContext {
  walletConnected: boolean;
  hasMonitoredWallet: boolean;
  hasHoldings: boolean;
  hasEntries: boolean;
  hasWatchlist: boolean;
  hasAlerts: boolean;
  isOffline: boolean;
  hasSelectedToken: boolean;
}
