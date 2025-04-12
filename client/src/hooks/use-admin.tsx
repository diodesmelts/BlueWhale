import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';

export function useAdmin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Use React Query for the admin check
  const { 
    data: adminCheckResult, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/admin/check'],
    queryFn: async () => {
      // Don't even attempt the admin check if there's no user
      if (!user) return { isAdmin: false };
      
      try {
        const response = await fetch("/api/admin/check");
        
        if (response.ok) {
          const data = await response.json();
          return { isAdmin: Boolean(data.isAdmin) };
        }
        
        return { isAdmin: false };
      } catch (error) {
        console.error("Failed to check admin status:", error);
        return { isAdmin: false };
      }
    },
    // Only run this query if we have a user and the user has isAdmin flag
    enabled: !!user,
    // Critical for proper admin detection after login
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false
  });

  // Force refetch of admin status when user changes
  useEffect(() => {
    if (user) {
      // If the user object itself indicates admin status, we optimize by setting value directly
      if (user.isAdmin) {
        queryClient.setQueryData(['/api/admin/check'], { isAdmin: true });
      }
      
      // Always refetch to ensure server-side verification
      refetch();
    } else {
      // Reset admin status when user logs out
      queryClient.setQueryData(['/api/admin/check'], { isAdmin: false });
    }
  }, [user, queryClient, refetch]);

  const isAdmin = adminCheckResult?.isAdmin || false;

  return { isAdmin, isLoading, error };
}