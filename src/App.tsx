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

// ⚡ Optimized QueryClient Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

      // Don't refetch on window focus (reduces unnecessary reads)
      refetchOnWindowFocus: false,

      // Don't refetch on mount if data exists
      refetchOnMount: false,

      // Retry failed queries once only
      retry: 1,

      // Keep previous data while fetching new data (smooth UX)
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

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

