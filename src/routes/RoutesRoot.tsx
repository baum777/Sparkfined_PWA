import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import { SwipeNavGate } from "../components/navigation/SwipeNavGate";
import AppShell from "@/components/layout/AppShell";

// Route-level code splitting (reduziert initial bundle)
const LandingPage = lazy(() => import("../pages/LandingPage"));
const ReplayPage = lazy(() => import("../pages/ReplayPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));
const SignalsPage = lazy(() => import("../pages/SignalsPage"));
const LessonsPage = lazy(() => import("../pages/LessonsPage"));
const IconShowcase = lazy(() => import("../pages/IconShowcase"));
const DashboardPageV2 = lazy(() => import("../pages/DashboardPageV2"));
const AnalysisPageV2 = lazy(() => import("../pages/AnalysisPageV2"));
const JournalPageV2 = lazy(() => import("../pages/JournalPageV2"));
const JournalV2PipelinePage = lazy(() => import("../features/journal-v2/pages/JournalV2Page"));
const OraclePage = lazy(() => import("../pages/OraclePage"));
const WatchlistPageV2 = lazy(() => import("../pages/WatchlistPageV2"));
const AlertsPageV2 = lazy(() => import("../pages/AlertsPageV2"));
const ChartPageV2 = lazy(() => import("../pages/ChartPageV2"));
const SettingsPageV2 = lazy(() => import("../pages/SettingsPageV2"));

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
            <Route path="/" element={<Navigate to="/dashboard-v2" replace />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard-v2" replace />} />
            <Route path="/board" element={<Navigate to="/dashboard-v2" replace />} />
            <Route path="/analyze" element={<Navigate to="/analysis-v2" replace />} />
            <Route path="/analysis" element={<Navigate to="/analysis-v2" replace />} />
            <Route path="/chart" element={<Navigate to="/chart-v2" replace />} />
            <Route path="/journal" element={<Navigate to="/journal-v2" replace />} />
            <Route path="/watchlist" element={<Navigate to="/watchlist-v2" replace />} />
            <Route path="/alerts" element={<Navigate to="/alerts-v2" replace />} />
            <Route path="/replay" element={<ReplayPage />} />
            <Route path="/replay/:sessionId" element={<ReplayPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/signals" element={<SignalsPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/dashboard-v2" element={<DashboardPageV2 />} />
            <Route path="/watchlist-v2" element={<WatchlistPageV2 />} />
            <Route path="/analysis-v2" element={<AnalysisPageV2 />} />
            <Route path="/journal/v2" element={<JournalV2PipelinePage />} />
            <Route path="/journal-v2" element={<JournalPageV2 />} />
            <Route path="/oracle" element={<OraclePage />} />
            <Route path="/alerts-v2" element={<AlertsPageV2 />} />
            <Route path="/chart-v2" element={<ChartPageV2 />} />
            <Route path="/settings-v2" element={<SettingsPageV2 />} />
            <Route path="/icons" element={<IconShowcase />} />

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
