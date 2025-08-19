import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingQuickAdd } from "@/components/FloatingQuickAdd";
import { PantryProvider } from "@/contexts/PantryContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PersonaProvider } from "@/contexts/PersonaContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ManagePersona from "./pages/ManagePersona";
import Pantry from "./pages/Pantry";
import ShoppingList from "./pages/ShoppingList";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import AcceptInvitation from "./pages/AcceptInvitation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthenticatedBottomNav = () => {
  const { user } = useAuth();
  return user ? <BottomNavigation /> : null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PersonaProvider>
          <NotificationsProvider>
            <PantryProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="pb-20">
                <Navigation />
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/manage-persona" element={
                    <ProtectedRoute>
                      <ManagePersona />
                    </ProtectedRoute>
                  } />
                  <Route path="/pantry" element={
                    <ProtectedRoute>
                      <Pantry />
                    </ProtectedRoute>
                  } />
                  <Route path="/shopping-list" element={
                    <ProtectedRoute>
                      <ShoppingList />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/upload" element={
                    <ProtectedRoute>
                      <Upload />
                    </ProtectedRoute>
                  } />
                  <Route path="/accept-invitation" element={<AcceptInvitation />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <FloatingQuickAdd />
              </div>
              <AuthenticatedBottomNav />
            </BrowserRouter>
            </PantryProvider>
          </NotificationsProvider>
        </PersonaProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
