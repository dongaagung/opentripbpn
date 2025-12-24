import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import PackagesAdmin from "./pages/admin/PackagesAdmin";
import GalleryAdmin from "./pages/admin/GalleryAdmin";
import TestimonialsAdmin from "./pages/admin/TestimonialsAdmin";
import MessagesAdmin from "./pages/admin/MessagesAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";
import FAQAdmin from "./pages/admin/FAQAdmin";
import ComparisonAdmin from "./pages/admin/ComparisonAdmin";
import TripLeaderAdmin from "./pages/admin/TripLeaderAdmin";
import HeroStatsAdmin from "./pages/admin/HeroStatsAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="packages" element={<PackagesAdmin />} />
              <Route path="gallery" element={<GalleryAdmin />} />
              <Route path="testimonials" element={<TestimonialsAdmin />} />
              <Route path="messages" element={<MessagesAdmin />} />
              <Route path="users" element={<UsersAdmin />} />
              <Route path="faq" element={<FAQAdmin />} />
              <Route path="comparison" element={<ComparisonAdmin />} />
              <Route path="trip-leader" element={<TripLeaderAdmin />} />
              <Route path="hero-stats" element={<HeroStatsAdmin />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
