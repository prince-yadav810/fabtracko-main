
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

import Index from "./pages/Index";
import WorkerPage from "./pages/WorkerPage";
import AttendancePage from "./pages/AttendancePage";
import PaymentPage from "./pages/PaymentPage";
import ReportPage from "./pages/ReportPage";
import AddWorkerPage from "./pages/AddWorkerPage";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes - No authentication required */}
            <Route path="/" element={<Index />} />
            <Route path="/workers" element={<WorkerPage />} />
            <Route path="/workers/add" element={<AddWorkerPage />} />
            <Route path="/workers/:workerId" element={<WorkerPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/reports" element={<ReportPage />} />
              
            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
