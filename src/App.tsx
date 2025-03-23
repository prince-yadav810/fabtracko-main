
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { AppProvider } from "./context/AppContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WorkerPage from "./pages/WorkerPage";
import AttendancePage from "./pages/AttendancePage";
import PaymentPage from "./pages/PaymentPage";
import ReportPage from "./pages/ReportPage";
import AddWorkerPage from "./pages/AddWorkerPage";

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/workers" element={<WorkerPage />} />
          <Route path="/workers/:workerId" element={<WorkerPage />} />
          <Route path="/workers/add" element={<AddWorkerPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/payments" element={<PaymentPage />} />
          <Route path="/reports" element={<ReportPage />} />
          <Route path="/reports/:workerId" element={<ReportPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
      <SonnerToaster position="top-right" />
    </AppProvider>
  );
}

export default App;
