import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginUser: (username: string, password: string) => Promise<User | null>;
  logoutUser: () => Promise<void>;
  registerUser: (username: string, email: string, password: string) => Promise<User | null>;
  // Direct access to mutations for form integration
  loginMutation: UseMutationResult<User, Error, LoginCredentials>;
  registerMutation: UseMutationResult<User, Error, RegisterCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

type LoginCredentials = {
  username: string;
  password: string;
};

type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [authenticating, setAuthenticating] = useState(false);

  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery<User>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) {
          if (res.status === 401) {
            return null;
          }
          throw new Error("Failed to fetch user data");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      setAuthenticating(true);
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Login failed");
        }
        return await res.json();
      } finally {
        setAuthenticating(false);
      }
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/user"], userData);
      
      // If user is an admin, immediately update the admin status cache as well
      if (userData.isAdmin) {
        queryClient.setQueryData(["/api/admin/check"], { isAdmin: true });
        // Force refetch to ensure server verification
        queryClient.invalidateQueries({ queryKey: ["/api/admin/check"] });
      }
      
      // Invalidate any user-related queries that might have changed
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${userData.username}!`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterCredentials) => {
      setAuthenticating(true);
      try {
        const res = await apiRequest("POST", "/api/register", userData);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Registration failed");
        }
        return await res.json();
      } finally {
        setAuthenticating(false);
      }
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/user"], userData);
      
      // If the newly registered user is an admin (unlikely but possible), update admin status 
      if (userData.isAdmin) {
        queryClient.setQueryData(["/api/admin/check"], { isAdmin: true });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/check"] });
      }
      
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Registration successful",
        description: `Welcome to CompetePro, ${userData.username}!`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Logout failed");
      }
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData(["/api/user"], null);
      
      // Clear admin status when logging out
      queryClient.setQueryData(["/api/admin/check"], { isAdmin: false });
      
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/check"] });
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const loginUser = async (username: string, password: string): Promise<User | null> => {
    try {
      return await loginMutation.mutateAsync({ username, password });
    } catch (error) {
      return null;
    }
  };

  const registerUser = async (username: string, email: string, password: string): Promise<User | null> => {
    try {
      return await registerMutation.mutateAsync({ username, email, password });
    } catch (error) {
      return null;
    }
  };

  const logoutUser = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: isLoading || authenticating,
        error: error || null,
        loginUser,
        logoutUser,
        registerUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}