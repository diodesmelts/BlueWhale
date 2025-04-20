import { ReactNode } from "react";
import { Redirect, Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";

type ProtectedRouteProps = {
  path: string;
  adminOnly?: boolean;
  children: ReactNode;
};

export function ProtectedRoute({ path, adminOnly = false, children }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const isLoading = authLoading || (adminOnly && adminLoading);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </Route>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/login" />
      </Route>
    );
  }

  // Admin routes check
  if (adminOnly && !isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // User is authenticated (and admin if required)
  return <Route path={path}>{children}</Route>;
}