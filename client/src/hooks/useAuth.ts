import { useQuery, useMutation } from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";

export function useAuth() {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      return await res.json();
    },
    onSuccess: () => {
      // Clear token from localStorage
      localStorage.removeItem("auth-token");
      // Clear user data from cache
      queryClient.setQueryData(["/api/user"], null);
      // Invalidate all queries to force re-fetch after logout
      queryClient.invalidateQueries();
      // Force a page reload to ensure clean state
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Logout error:", error);
      // Even if logout fails, clear local cache and reload
      localStorage.removeItem("auth-token");
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries();
      window.location.href = "/";
    },
  });

  return {
    user: user ?? null,
    isLoading,
    error,
    isAuthenticated: !!user,
    logoutMutation,
  };
}