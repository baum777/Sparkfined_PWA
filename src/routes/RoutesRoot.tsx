import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UpdateBanner from "../components/UpdateBanner";
import ErrorBoundary from "../components/ErrorBoundary";
import { SwipeNavGate } from "../components/navigation/SwipeNavGate";
import { initializeEventSubscriptions } from "@/ai/ingest/eventSubscriptions";

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
const WatchlistPageV2 = lazy(() => import("../pages/WatchlistPageV2"));
const AlertsPageV2 = lazy(() => import("../pages/AlertsPageV2"));
const ChartPageV2 = lazy(() => import("../pages/ChartPageV2"));
const SettingsPageV2 = lazy(() => import("../pages/SettingsPageV2"));
const OraclePage = lazy(() => import("../pages/OraclePage"));

// Dev-only showcase pages (excluded from production bundle)
const StyleShowcasePage = import.meta.env.DEV
  ? lazy(() => import("../pages/StyleShowcasePage"))
  : lazy(() => Promise.resolve({ default: () => null }));

const UXShowcasePage = import.meta.env.DEV
  ? lazy(() => import("../pages/UXShowcasePage"))
  : lazy(() => Promise.resolve({ default: () => null }));

function Fallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" data-testid="app-loading">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-emerald-500 mb-4"></div>
        <p className="text-slate-300 text-lg">Lade…</p>
      </div>
    </div>
  );
}

export default function RoutesRoot() {
  useEffect(() => {
    initializeEventSubscriptions();
  }, []);

  return (
    <ErrorBoundary>
      {/* Läuft jetzt im Router-Kontext, da main.tsx wrappt */}
      <SwipeNavGate />
      <UpdateBanner />
      <Suspense fallback={<Fallback />}>
        <Routes>
          {/* Landing Page - No Layout (standalone) */}
          <Route path="/landing" element={<LandingPage />} />

          {/* App Routes - With Layout */}
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
          
          <Route path="*" element={<div className="p-6 text-zinc-400">404</div>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
