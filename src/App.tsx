import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Search from "./pages/Search";
import CenterPage from "./pages/CenterPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import CenterLogin from "./pages/CenterLogin";
import CenterRegister from "./pages/CenterRegister";
import CenterDashboard from "./pages/CenterDashboard";
import AcceptInvitation from "./pages/AcceptInvitation";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { SuperAdminRoute, CenterAdminRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/center/:id" element={<CenterPage />} />
          <Route path="/center/:username" element={<CenterPage />} />

          {/* Auth Routes */}
          <Route path="/center/login" element={<CenterLogin />} />
          <Route path="/center/register" element={<CenterRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/invitation/accept" element={<AcceptInvitation />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes - Center Admin */}
          <Route
            path="/center/dashboard"
            element={
              <CenterAdminRoute>
                <CenterDashboard />
              </CenterAdminRoute>
            }
          />

          {/* Protected Routes - Super Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <SuperAdminRoute>
                <AdminDashboard />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <SuperAdminRoute>
                <AdminDashboard />
              </SuperAdminRoute>
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

