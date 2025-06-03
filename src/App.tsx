
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LandingPage } from "@/components/landing/LandingPage";
import { WorkspaceDashboard } from "@/components/workspace/WorkspaceDashboard";
import { QuestionAnswering } from "@/pages/QuestionAnswering";
import { AILinker } from "@/pages/AILinker";
import { KnowledgeGraph } from "@/pages/KnowledgeGraph";
import { AutoTagGenerator } from "@/pages/AutoTagGenerator";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1D29] to-[#0F1419] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1D29] to-[#0F1419] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={<LandingPage />}
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <WorkspaceDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/question-answering" 
        element={
          <ProtectedRoute>
            <QuestionAnswering />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ai-linker" 
        element={
          <ProtectedRoute>
            <AILinker />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/knowledge-graph" 
        element={
          <ProtectedRoute>
            <KnowledgeGraph />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/auto-tag-generator" 
        element={
          <ProtectedRoute>
            <AutoTagGenerator />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workspace" 
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen w-full">
            <AppRoutes />
            <Toaster />
            <Sonner />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
