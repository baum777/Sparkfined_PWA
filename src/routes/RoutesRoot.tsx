import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import UpdateBanner from "../components/UpdateBanner";
import { AccessProvider } from "../store/AccessProvider";
import ErrorBoundary from "../components/ErrorBoundary";
import { SwipeNavGate } from "../components/navigation/SwipeNavGate";

// Route-level code splitting (reduziert initial bundle)
const LandingPage = lazy(() => import("../pages/LandingPage"));
const BoardPage = lazy(() => import("../pages/BoardPage"));
const AnalyzePage = lazy(() => import("../pages/AnalyzePage"));
const ChartPage = lazy(() => import("../pages/ChartPage"));
const JournalPage = lazy(() => import("../pages/JournalPage"));
const ReplayPage = lazy(() => import("../pages/ReplayPage"));
const AccessPage = lazy(() => import("../pages/AccessPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));
const SignalsPage = lazy(() => import("../pages/SignalsPage"));
const LessonsPage = lazy(() => import("../pages/LessonsPage"));
const IconShowcase = lazy(() => import("../pages/IconShowcase"));

function Fallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-emerald-500 mb-4"></div>
        <p className="text-slate-300 text-lg">Lade…</p>
      </div>
    </div>
  );
}

export default function RoutesRoot() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* Swipe Navigation Gate - Runs hook safely within Router context */}
        <SwipeNavGate />
        <AccessProvider>
          <UpdateBanner />
          <Suspense fallback={<Fallback />}>
            <Routes>
            {/* Landing Page - No Layout (standalone) */}
            <Route path="/landing" element={<LandingPage />} />
            
            {/* App Routes - With Layout */}
            <Route path="/" element={
              <Layout>
                <BoardPage />
              </Layout>
            } />
            <Route path="/analyze" element={
              <Layout>
                <AnalyzePage />
              </Layout>
            } />
            <Route path="/chart" element={
              <Layout>
                <ChartPage />
              </Layout>
            } />
            <Route path="/journal" element={
              <Layout>
                <JournalPage />
              </Layout>
            } />
            <Route path="/replay" element={
              <Layout>
                <ReplayPage />
              </Layout>
            } />
            <Route path="/access" element={
              <Layout>
                <AccessPage />
              </Layout>
            } />
            <Route path="/settings" element={
              <Layout>
                <SettingsPage />
              </Layout>
            } />
            <Route path="/notifications" element={
              <Layout>
                <NotificationsPage />
              </Layout>
            } />
            <Route path="/signals" element={
              <Layout>
                <SignalsPage />
              </Layout>
            } />
            <Route path="/lessons" element={
              <Layout>
                <LessonsPage />
              </Layout>
            } />
            <Route path="/icons" element={<IconShowcase />} />
            <Route path="*" element={<div className="p-6 text-zinc-400">404</div>} />
            </Routes>
          </Suspense>
        </AccessProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
