import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import CompetitionsPage from "@/pages/CompetitionsPage";
import MyEntries from "@/pages/MyEntries";
import MyWins from "@/pages/MyWins";
import Leaderboard from "@/pages/Leaderboard";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/competitions" component={CompetitionsPage} />
      <Route path="/my-entries" component={MyEntries} />
      <Route path="/my-wins" component={MyWins} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-lightGray pb-16 md:pb-0">
            <Router />
          </main>
          <MobileNav />
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
