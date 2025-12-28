import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppShell } from "@/features/shell";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Learn from "./pages/Learn";
import Chart from "./pages/Chart";
import Alerts from "./pages/Alerts";
import SettingsPage from "./pages/SettingsPage";
import Watchlist from "./pages/Watchlist";
import Oracle from "./pages/Oracle";
import Replay from "./pages/Replay";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              {/* Primary tabs */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/chart" element={<Chart />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Secondary tabs (Advanced) */}
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/oracle" element={<Oracle />} />
              {/* Replay is a Chart sub-feature, not in global nav */}
              <Route path="/replay" element={<Replay />} />
            </Route>
            {/* Catch-all for unknown routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
