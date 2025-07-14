import { useQuery } from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { getQueryFn } from "../lib/queryClient";

export function useAuth() {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return {
    user: user ?? null,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}