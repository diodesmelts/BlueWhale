import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import CompetitionsPage from "@/pages/CompetitionsPage";
import CompetitionDetailPage from "@/pages/CompetitionDetailPage";
import FamilyCompetitionsPage from "@/pages/FamilyCompetitionsPage";
import AppliancesCompetitionsPage from "@/pages/AppliancesCompetitionsPage";
import CashCompetitionsPage from "@/pages/CashCompetitionsPage";
import MyEntries from "@/pages/MyEntries";
import MyWins from "@/pages/MyWins";
import Leaderboard from "@/pages/Leaderboard";
import AdminPage from "@/pages/AdminPage";
import ListingsPage from "@/pages/ListingsPage";
import AuthPage from "@/pages/AuthPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import AboutPage from "@/pages/AboutPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import FAQsPage from "@/pages/FAQsPage";
import ContactPage from "@/pages/ContactPage";
import CookiesPage from "@/pages/CookiesPage";
import ResponsibleGamblingPage from "@/pages/ResponsibleGamblingPage";
import SitemapPage from "@/pages/SitemapPage";
import PaymentMethodsPage from "@/pages/PaymentMethodsPage";
import HowToPlayPage from "@/pages/HowToPlayPage";
import TopNav from "@/components/layout/TopNav";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
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
      <Route path="/competitions/family" component={FamilyCompetitionsPage} />
      <Route path="/competitions/appliances" component={AppliancesCompetitionsPage} />
      <Route path="/competitions/cash" component={CashCompetitionsPage} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      {/* Static Content Pages */}
      <Route path="/how-to-play" component={HowToPlayPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/faqs" component={FAQsPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/cookies" component={CookiesPage} />
      <Route path="/responsible-gambling" component={ResponsibleGamblingPage} />
      <Route path="/sitemap" component={SitemapPage} />
      <Route path="/payment-methods" component={PaymentMethodsPage} />
      
      {/* User protected routes - require login */}
      <ProtectedRoute path="/my-entries">
        <MyEntries />
      </ProtectedRoute>
      <ProtectedRoute path="/my-wins">
        <MyWins />
      </ProtectedRoute>
      <ProtectedRoute path="/profile">
        <ProfilePage />
      </ProtectedRoute>
      
      {/* Admin protected routes */}
      <ProtectedRoute path="/admin" adminOnly={true}>
        <AdminPage />
      </ProtectedRoute>
      
      <ProtectedRoute path="/listings" adminOnly={true}>
        <ListingsPage />
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
          <div className="flex flex-col min-h-screen">
            <TopNav />
            <main className="flex-1 overflow-y-auto bg-gray-50 pb-20 md:pb-0">
              <Router />
            </main>
            <Footer />
            <MobileNav />
          </div>
          <Toaster />
        </PaymentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
