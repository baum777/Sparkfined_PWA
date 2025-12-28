import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import { SwipeNavGate } from "../components/navigation/SwipeNavGate";
import AppShell from "@/components/layout/AppShell";

// Route-level code splitting (reduziert initial bundle)
const LandingPage = lazy(() => import("../pages/LandingPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));
const SignalsPage = lazy(() => import("../pages/SignalsPage"));
const LessonsPage = lazy(() => import("../pages/LessonsPage"));
const IconShowcase = lazy(() => import("../pages/IconShowcase"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const JournalPage = lazy(() => import("../pages/JournalPage"));
const OraclePage = lazy(() => import("../pages/OraclePage"));
const WatchlistPage = lazy(() => import("../pages/WatchlistPage"));
const AlertsPage = lazy(() => import("../pages/AlertsPage"));
const ChartPage = lazy(() => import("../pages/ChartPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));

// Dev-only showcase pages (excluded from production bundle)
const StyleShowcasePage = import.meta.env.DEV
  ? lazy(() => import("../pages/StyleShowcasePage"))
  : lazy(() => Promise.resolve({ default: () => null }));

const UXShowcasePage = import.meta.env.DEV
  ? lazy(() => import("../pages/UXShowcasePage"))
  : lazy(() => Promise.resolve({ default: () => null }));

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-gradient" data-testid="app-loading">
      <div className="text-center text-text-secondary">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface/60">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border/40 border-t-brand" />
        </div>
        <p className="text-base font-medium tracking-wide text-text-primary">Loading Sparkfined</p>
        <p className="text-sm text-text-secondary/80">Preparing your adaptive workspace…</p>
      </div>
    </div>
  );
}

function LegacyRedirect({ to }: { to: string }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}${location.hash}`} replace />;
}

export default function RoutesRoot() {
  return (
    <ErrorBoundary>
      {/* Läuft jetzt im Router-Kontext, da main.tsx wrappt */}
      <SwipeNavGate />
      <Suspense fallback={<Fallback />}>
        <Routes>
          {/* Landing Page - No Layout (standalone) */}
          <Route path="/landing" element={<LandingPage />} />

          {/* App Shell */}
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/board" element={<Navigate to="/dashboard" replace />} />
            <Route path="/analyze" element={<Navigate to="/chart" replace />} />
            <Route path="/analysis" element={<Navigate to="/chart" replace />} />
            <Route path="/chart" element={<ChartPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            {/* Replay is a Chart mode: mount ChartPage in replay state (Chart tab stays active). */}
            <Route path="/replay" element={<ChartPage mode="replay" />} />
            <Route path="/replay/:sessionId" element={<ChartPage mode="replay" />} />
            {/* TODO(Product): Decide whether NotificationsPage should stay, be removed, or be re-added to navigation */}
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/signals" element={<SignalsPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/journal/v2" element={<Navigate to="/journal" replace />} />
            <Route path="/oracle" element={<OraclePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/icons" element={<IconShowcase />} />

            {/* Legacy V2 routes (redirect to canonical paths) */}
            <Route path="/dashboard-v2" element={<LegacyRedirect to="/dashboard" />} />
            <Route path="/watchlist-v2" element={<LegacyRedirect to="/watchlist" />} />
            <Route path="/analysis-v2" element={<LegacyRedirect to="/chart" />} />
            <Route path="/journal-v2" element={<LegacyRedirect to="/journal" />} />
            <Route path="/alerts-v2" element={<LegacyRedirect to="/alerts" />} />
            {/* Keep /chart-v2 as a first-class route (E2E + deep links rely on it). */}
            <Route path="/chart-v2" element={<ChartPage />} />
            <Route path="/settings-v2" element={<LegacyRedirect to="/settings" />} />

            {/* Dev-only showcase routes */}
            {import.meta.env.DEV && (
              <>
                <Route path="/styles" element={<StyleShowcasePage />} />
                <Route path="/ux" element={<UXShowcasePage />} />
              </>
            )}
          </Route>

          <Route
            path="*"
            element={
              <div className="flex min-h-screen items-center justify-center bg-app-gradient px-6 text-center text-text-secondary">
                <div className="space-y-3 rounded-3xl border border-border bg-surface/70 px-8 py-10 shadow-card-subtle">
                  <p className="text-sm uppercase tracking-[0.3em] text-text-tertiary">Navigation</p>
                  <p className="text-3xl font-semibold text-text-primary">404 — Page Not Found</p>
                  <p className="text-base text-text-secondary">
                    The requested surface is outside the adaptive shell. Use the sidebar or bottom nav to continue.
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
