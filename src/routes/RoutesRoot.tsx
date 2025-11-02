import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import UpdateBanner from "../components/UpdateBanner";
import { AccessProvider } from "../store/AccessProvider";

// Route-level code splitting (reduziert initial bundle)
const AnalyzePage = lazy(() => import("../pages/AnalyzePage"));
const ChartPage = lazy(() => import("../pages/ChartPage"));
const JournalPage = lazy(() => import("../pages/JournalPage"));
const ReplayPage = lazy(() => import("../pages/ReplayPage"));
const AccessPage = lazy(() => import("../pages/AccessPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));
const WatchlistPage = lazy(() => import("../pages/WatchlistPage"));
const ConstellationPage = lazy(() => import("../pages/ConstellationPage"));

function Fallback() {
  return <div className="p-6 text-zinc-400">Lade…</div>;
}

export default function RoutesRoot() {
  return (
    <BrowserRouter>
      <AccessProvider>
        <UpdateBanner />
        <Layout>
          <Suspense fallback={<Fallback />}>
            <Routes>
              <Route path="/" element={<AnalyzePage />} />
              <Route path="/chart" element={<ChartPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/replay" element={<ReplayPage />} />
              <Route path="/access" element={<AccessPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/constellation" element={<ConstellationPage />} />
              <Route path="*" element={<div className="p-6 text-zinc-400">404</div>} />
            </Routes>
          </Suspense>
        </Layout>
      </AccessProvider>
    </BrowserRouter>
  );
}
