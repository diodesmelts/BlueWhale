import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import CompetitionsPage from "@/pages/CompetitionsPage";
import CompetitionDetailPage from "@/pages/CompetitionDetailPage";
import MyEntries from "@/pages/MyEntries";
import MyWins from "@/pages/MyWins";
import Leaderboard from "@/pages/Leaderboard";
import AdminPage from "@/pages/AdminPage";
import AuthPage from "@/pages/AuthPage";
import TopNav from "@/components/layout/TopNav";
import MobileNav from "@/components/layout/MobileNav";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PaymentProvider } from "@/components/payments/PaymentProvider";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Dashboard} />
      <Route path="/competitions" component={CompetitionsPage} />
      <Route path="/competitions/:id" component={CompetitionDetailPage} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/auth" component={AuthPage} />
      
      {/* User protected routes - require login */}
      <ProtectedRoute path="/my-entries">
        <MyEntries />
      </ProtectedRoute>
      <ProtectedRoute path="/my-wins">
        <MyWins />
      </ProtectedRoute>
      
      {/* Admin protected route */}
      <ProtectedRoute path="/admin" adminOnly={true}>
        <AdminPage />
      </ProtectedRoute>
      
      {/* Fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PaymentProvider>
          <div className="flex flex-col h-screen overflow-hidden">
            <TopNav />
            <main className="flex-1 overflow-y-auto bg-gray-50 pb-20 md:pb-10">
              <Router />
            </main>
            <MobileNav />
          </div>
          <Toaster />
        </PaymentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
