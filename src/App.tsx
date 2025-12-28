import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppShell } from "@/features/shell";
import { HandbookPanelProvider } from "@/hooks/useHandbookPanel";
import { HandbookSheet, GlobalActionHandler } from "@/components/handbook";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Learn from "./pages/Learn";
import Chart from "./pages/Chart";
import Alerts from "./pages/Alerts";
import SettingsPage from "./pages/SettingsPage";
import Watchlist from "./pages/Watchlist";
import Oracle from "./pages/Oracle";
import Replay from "./pages/Replay";
import Handbook from "./pages/Handbook";
import NotFound from "./pages/NotFound";

import { WalletContextProvider } from "@/components/WalletContextProvider";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WalletGuard } from "@/components/WalletGuard";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WalletContextProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <HandbookPanelProvider>
                <HandbookSheet />
                <GlobalActionHandler />
                <Routes>
                  <Route element={<AppShell />}>
                    {/* Primary tabs */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/journal" element={
                      <WalletGuard>
                        <Journal />
                      </WalletGuard>
                    } />
                    <Route path="/lessons" element={<Learn />} />
                    <Route path="/chart" element={<Chart />} />
                    <Route path="/chart/replay" element={<Replay />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    {/* Secondary tabs (Advanced) */}
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/oracle" element={<Oracle />} />
                    <Route path="/handbook" element={<Handbook />} />
                    {/* Legacy /replay redirect to /chart/replay */}
                    <Route path="/replay" element={<Replay />} />
                    {/* Alias: /learn redirects to /lessons */}
                    <Route path="/learn" element={<Learn />} />
                  </Route>
                  {/* Catch-all for unknown routes */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </HandbookPanelProvider>
            </BrowserRouter>
          </TooltipProvider>
        </WalletContextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </ThemeProvider>
);

export default App;
