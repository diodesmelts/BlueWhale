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
import TopNav from "@/components/layout/TopNav";
import MobileNav from "@/components/layout/MobileNav";

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
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
          <Router />
        </main>
        <MobileNav />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
