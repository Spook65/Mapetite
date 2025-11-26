/**
 * React Hooks for User Authentication API
 *
 * This file provides convenient React hooks for managing user authentication
 * with proper state management, caching, and error handling.
 */

import {
	type LoginRequest,
	type LoginResponse,
	type RegisterRequest,
	type RegisterResponse,
	type UserProfileResponse,
	getUserProfile,
	loginUser,
	registerUser,
} from "@/lib/api/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys for authentication
export const AUTH_QUERY_KEYS = {
	profile: (token: string) => ["user", "profile", token] as const,
	currentProfile: ["user", "profile", "current"] as const,
};

// ==================== Profile Query Hook ====================

/**
 * Hook for fetching the authenticated user's profile
 * Provides automatic caching, refetching, and loading states.
 */
export function useUserProfile(
	authToken: string,
	options?: {
		enabled?: boolean;
		refetchOnMount?: boolean;
	},
) {
	return useQuery<UserProfileResponse, Error>({
		queryKey: AUTH_QUERY_KEYS.profile(authToken),
		queryFn: () => getUserProfile(authToken),
		enabled: (options?.enabled ?? true) && !!authToken,
		refetchOnMount: options?.refetchOnMount ?? true,
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: false, // Don't retry on auth failures
	});
}

// ==================== Registration Mutation Hook ====================

/**
 * Hook for user registration
 * Provides mutation function for registering new users with loading and error states.
 */
export function useRegister(options?: {
	onSuccess?: (data: RegisterResponse) => void;
	onError?: (error: Error) => void;
}) {
	const queryClient = useQueryClient();

	return useMutation<RegisterResponse, Error, RegisterRequest>({
		mutationFn: registerUser,

		onSuccess: (data) => {
			// Cache the user profile data
			queryClient.setQueryData<UserProfileResponse>(
				AUTH_QUERY_KEYS.profile(data.auth_token),
				{
					status: "Success",
					user_id: data.user_id,
					name: data.name,
					email: data.email,
					favorite_restaurant_ids: [],
				},
			);

			options?.onSuccess?.(data);
		},

		onError: options?.onError,
	});
}

// ==================== Login Mutation Hook ====================

/**
 * Hook for user login
 * Provides mutation function for logging in users with loading and error states.
 */
export function useLogin(options?: {
	onSuccess?: (data: LoginResponse) => void;
	onError?: (error: Error) => void;
}) {
	const queryClient = useQueryClient();

	return useMutation<LoginResponse, Error, LoginRequest>({
		mutationFn: loginUser,

		onSuccess: (data) => {
			// Cache the user profile data
			queryClient.setQueryData<UserProfileResponse>(
				AUTH_QUERY_KEYS.profile(data.auth_token),
				{
					status: "Success",
					user_id: data.user_id,
					name: data.name,
					email: data.email,
					favorite_restaurant_ids: [], // Will be populated when profile is fetched
				},
			);

			options?.onSuccess?.(data);
		},

		onError: options?.onError,
	});
}

// ==================== Combined Auth Manager Hook ====================

/**
 * Hook that provides a complete authentication management interface
 * Combines profile fetching with login/register mutations for easy auth management.
 */
export function useAuthManager(authToken: string | null) {
	const profileQuery = useUserProfile(authToken || "", {
		enabled: !!authToken,
	});

	const registerMutation = useRegister();
	const loginMutation = useLogin();
	const queryClient = useQueryClient();

	const logout = () => {
		// Clear all cached auth data
		queryClient.removeQueries({ queryKey: ["user"] });
		localStorage.removeItem("creao_auth_token");
	};

	return {
		// Profile data
		profile: profileQuery.data,
		isLoadingProfile: profileQuery.isLoading,
		profileError: profileQuery.error,
		refetchProfile: profileQuery.refetch,

		// Registration
		register: registerMutation.mutate,
		isRegistering: registerMutation.isPending,
		registerError: registerMutation.error,

		// Login
		login: loginMutation.mutate,
		isLoggingIn: loginMutation.isPending,
		loginError: loginMutation.error,

		// Logout
		logout,

		// Utility
		isAuthenticated: !!authToken && !!profileQuery.data,
		isLoading:
			profileQuery.isLoading ||
			registerMutation.isPending ||
			loginMutation.isPending,
	};
}

// ==================== Auth State Hook ====================

/**
 * Hook for managing authentication state with localStorage persistence
 * Automatically syncs auth token with localStorage and provides login/logout functions.
 */
export function useAuthState() {
	const queryClient = useQueryClient();

	// Get initial token from localStorage
	const getToken = () =>
		typeof window !== "undefined"
			? localStorage.getItem("creao_auth_token")
			: null;

	const authToken = getToken();

	const profileQuery = useUserProfile(authToken || "", {
		enabled: !!authToken,
	});

	const registerMutation = useRegister({
		onSuccess: (data) => {
			localStorage.setItem("creao_auth_token", data.auth_token);
			// Force re-render by invalidating queries
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
	});

	const loginMutation = useLogin({
		onSuccess: (data) => {
			localStorage.setItem("creao_auth_token", data.auth_token);
			// Force re-render by invalidating queries
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
	});

	const logout = () => {
		localStorage.removeItem("creao_auth_token");
		queryClient.removeQueries({ queryKey: ["user"] });
		// Force re-render
		queryClient.invalidateQueries();
	};

	return {
		authToken,
		profile: profileQuery.data,
		isAuthenticated: !!authToken && !!profileQuery.data,
		isLoading:
			profileQuery.isLoading ||
			registerMutation.isPending ||
			loginMutation.isPending,

		// Mutations
		register: registerMutation.mutate,
		login: loginMutation.mutate,
		logout,

		// States
		isRegistering: registerMutation.isPending,
		isLoggingIn: loginMutation.isPending,

		// Errors
		profileError: profileQuery.error,
		registerError: registerMutation.error,
		loginError: loginMutation.error,
	};
}
