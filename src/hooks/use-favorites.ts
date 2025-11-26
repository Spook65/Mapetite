/**
 * React Hooks for User Favorites API
 *
 * This file provides convenient React hooks for managing user favorites
 * with proper state management, caching, and optimistic updates.
 */

import {
	type GetFavoritesResponse,
	type ToggleFavoriteRequest,
	type ToggleFavoriteResponse,
	getFavorites,
	toggleFavorite,
} from "@/lib/api/user-favorites";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query key for favorites
export const FAVORITES_QUERY_KEY = ["user", "favorites"];

// ==================== Query Hook ====================

/**
 * Hook for fetching the user's favorites list
 *
 * Provides automatic caching, refetching, and loading states.
 *
 * @param options - Optional query configuration
 * @returns Query result with favorites data and state
 *
 * @example
 * ```tsx
 * function FavoritesList() {
 *   const { data, isLoading, error } = useFavorites();
 *
 *   if (isLoading) return <div>Loading favorites...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h2>My Favorites ({data.count})</h2>
 *       <ul>
 *         {data.favorites.map(id => (
 *           <li key={id}>{id}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFavorites(options?: {
	enabled?: boolean;
	refetchOnMount?: boolean;
}) {
	return useQuery<GetFavoritesResponse, Error>({
		queryKey: FAVORITES_QUERY_KEY,
		queryFn: getFavorites,
		enabled: options?.enabled ?? true,
		refetchOnMount: options?.refetchOnMount ?? true,
		staleTime: 2 * 60 * 1000, // 2 minutes (favorites change less frequently)
	});
}

// ==================== Mutation Hook ====================

/**
 * Hook for toggling a restaurant in favorites
 *
 * Provides optimistic updates for instant UI feedback.
 *
 * @param options - Optional callbacks for success/error handling
 * @returns Mutation function and state
 *
 * @example
 * ```tsx
 * function FavoriteButton({ restaurantId }: { restaurantId: string }) {
 *   const { data: favorites } = useFavorites();
 *   const { mutate, isPending } = useToggleFavorite();
 *
 *   const isFavorited = favorites?.favorites.includes(restaurantId) ?? false;
 *
 *   return (
 *     <button
 *       onClick={() => mutate({ restaurant_id: restaurantId })}
 *       disabled={isPending}
 *     >
 *       {isFavorited ? "❤️ Favorited" : "🤍 Favorite"}
 *     </button>
 *   );
 * }
 * ```
 */
// Context type for optimistic updates
interface ToggleFavoriteContext {
	previousFavorites?: GetFavoritesResponse;
}

export function useToggleFavorite(options?: {
	onSuccess?: (data: ToggleFavoriteResponse) => void;
	onError?: (error: Error) => void;
}) {
	const queryClient = useQueryClient();

	return useMutation<
		ToggleFavoriteResponse,
		Error,
		ToggleFavoriteRequest,
		ToggleFavoriteContext
	>({
		mutationFn: toggleFavorite,

		// Optimistic update - update UI immediately before API call completes
		onMutate: async (request) => {
			// Cancel any ongoing refetches
			await queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });

			// Get current favorites
			const previousFavorites =
				queryClient.getQueryData<GetFavoritesResponse>(FAVORITES_QUERY_KEY);

			// Optimistically update favorites
			if (previousFavorites) {
				const isCurrentlyFavorited = previousFavorites.favorites.includes(
					request.restaurant_id,
				);

				const updatedFavorites = isCurrentlyFavorited
					? previousFavorites.favorites.filter(
							(id) => id !== request.restaurant_id,
						) // Remove
					: [...previousFavorites.favorites, request.restaurant_id]; // Add

				queryClient.setQueryData<GetFavoritesResponse>(FAVORITES_QUERY_KEY, {
					favorites: updatedFavorites,
					count: updatedFavorites.length,
					last_updated: new Date().toISOString(),
				});
			}

			// Return context for rollback on error
			return { previousFavorites };
		},

		// On error, rollback to previous state
		onError: (error, _request, context) => {
			if (context?.previousFavorites) {
				queryClient.setQueryData(
					FAVORITES_QUERY_KEY,
					context.previousFavorites,
				);
			}
			options?.onError?.(error);
		},

		// On success, update with server response
		onSuccess: (data) => {
			queryClient.setQueryData<GetFavoritesResponse>(FAVORITES_QUERY_KEY, {
				favorites: data.favorites,
				count: data.count,
				last_updated: new Date().toISOString(),
			});
			options?.onSuccess?.(data);
		},
	});
}

// ==================== Utility Hook ====================

/**
 * Hook to check if a specific restaurant is favorited
 *
 * @param restaurantId - Restaurant ID to check
 * @returns Object with isFavorited boolean and loading state
 *
 * @example
 * ```tsx
 * function RestaurantCard({ restaurantId }: { restaurantId: string }) {
 *   const { isFavorited, isLoading } = useIsFavorite(restaurantId);
 *
 *   return (
 *     <div>
 *       {isLoading ? (
 *         <span>...</span>
 *       ) : (
 *         <span>{isFavorited ? "❤️" : "🤍"}</span>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIsFavorite(restaurantId: string) {
	const { data, isLoading } = useFavorites();

	return {
		isFavorited: data?.favorites.includes(restaurantId) ?? false,
		isLoading,
		favoritesCount: data?.count ?? 0,
	};
}

// ==================== Combined Action Hook ====================

/**
 * Hook that combines favorites data with toggle mutation
 *
 * Provides a complete favorites management interface in one hook.
 *
 * @returns Object with favorites data, toggle function, and utility methods
 *
 * @example
 * ```tsx
 * function FavoritesManager() {
 *   const {
 *     favorites,
 *     isLoading,
 *     toggleFavorite,
 *     isFavorited,
 *     isPending
 *   } = useFavoritesManager();
 *
 *   return (
 *     <div>
 *       <h2>Favorites ({favorites?.count ?? 0})</h2>
 *       {favorites?.favorites.map(id => (
 *         <div key={id}>
 *           {id}
 *           <button
 *             onClick={() => toggleFavorite(id)}
 *             disabled={isPending}
 *           >
 *             Remove
 *           </button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFavoritesManager() {
	const favoritesQuery = useFavorites();
	const toggleMutation = useToggleFavorite();

	return {
		// Query data
		favorites: favoritesQuery.data,
		isLoading: favoritesQuery.isLoading,
		error: favoritesQuery.error,
		refetch: favoritesQuery.refetch,

		// Mutation
		toggleFavorite: (restaurantId: string) =>
			toggleMutation.mutate({ restaurant_id: restaurantId }),
		isPending: toggleMutation.isPending,
		isSuccess: toggleMutation.isSuccess,
		mutationError: toggleMutation.error,

		// Utility
		isFavorited: (restaurantId: string) =>
			favoritesQuery.data?.favorites.includes(restaurantId) ?? false,
		favoritesCount: favoritesQuery.data?.count ?? 0,
	};
}
