// Handbook spec index - maps routes to their specs
import type { HandbookPageSpec } from "../types";

import dashboardSpec from "./dashboard.json";
import journalSpec from "./journal.json";
import lessonsSpec from "./lessons.json";
import chartSpec from "./chart.json";
import alertsSpec from "./alerts.json";
import settingsSpec from "./settings.json";
import watchlistSpec from "./watchlist.json";
import oracleSpec from "./oracle.json";

export const handbookSpecs: Record<string, HandbookPageSpec> = {
  "/": dashboardSpec as HandbookPageSpec,
  "/dashboard": dashboardSpec as HandbookPageSpec,
  "/journal": journalSpec as HandbookPageSpec,
  "/lessons": lessonsSpec as HandbookPageSpec,
  "/learn": lessonsSpec as HandbookPageSpec,
  "/chart": chartSpec as HandbookPageSpec,
  "/chart/replay": chartSpec as HandbookPageSpec,
  "/replay": chartSpec as HandbookPageSpec,
  "/alerts": alertsSpec as HandbookPageSpec,
  "/settings": settingsSpec as HandbookPageSpec,
  "/watchlist": watchlistSpec as HandbookPageSpec,
  "/oracle": oracleSpec as HandbookPageSpec,
};

export function getHandbookSpec(route: string): HandbookPageSpec | null {
  // Normalize route
  const normalizedRoute = route.split("?")[0]; // Remove query params
  return handbookSpecs[normalizedRoute] || null;
}

export function getAllSpecs(): HandbookPageSpec[] {
  // Return unique specs (avoid duplicates from aliases)
  const seen = new Set<string>();
  return Object.values(handbookSpecs).filter((spec) => {
    if (seen.has(spec.id)) return false;
    seen.add(spec.id);
    return true;
  });
}
