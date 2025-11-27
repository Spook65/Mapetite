/**
 * React Hooks for User Favorites using ORM
 *
 * This file provides convenient React hooks for managing user favorites
 * with proper state management, caching, and optimistic updates.
 * Uses the FavoriteORM for direct data access.
 */

import {
	type FavoriteModel,
	FavoriteORM,
} from "@/components/data/orm/orm_favorite";
import { getAuthToken } from "@/lib/auth-integration";
import { getUserIdFromToken } from "@/lib/jwt-utils";
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
export interface GetFavoritesResponse {
	/** Array of restaurant IDs that the user has favorited */
	favorites: string[];

	/** Total count of favorites */
	count: number;

	/** Timestamp when the list was last updated */
	last_updated?: string;
}

export function useFavorites(options?: {
	enabled?: boolean;
	refetchOnMount?: boolean;
}) {
	return useQuery<GetFavoritesResponse, Error>({
		queryKey: FAVORITES_QUERY_KEY,
		queryFn: async () => {
			// Get user ID from auth token
			const token = getAuthToken();
			if (!token) {
				throw new Error("User is not authenticated");
			}

			const userId = getUserIdFromToken(token);
			if (!userId) {
				throw new Error("Unable to extract user_id from authentication token");
			}

			// Use ORM to fetch favorites
			const orm = FavoriteORM.getInstance();
			const favoriteRecords = await orm.getFavoriteByUserId(userId);

			// Extract restaurant IDs
			const restaurantIds = favoriteRecords.map(
				(record) => record.restaurant_id,
			);

			return {
				favorites: restaurantIds,
				count: restaurantIds.length,
				last_updated: new Date().toISOString(),
			};
		},
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

export interface ToggleFavoriteRequest {
	/** Restaurant ID to add or remove from favorites */
	restaurant_id: string;
}

export interface ToggleFavoriteResponse {
	/** Status of the operation */
	status: "Success" | "Failed";

	/** Action that was performed */
	action: "added" | "removed";

	/** The restaurant ID that was toggled */
	restaurant_id: string;

	/** Updated list of all favorite restaurant IDs */
	favorites: string[];

	/** Total count of favorites after the operation */
	count: number;

	/** Optional message */
	message?: string;
}

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
		mutationFn: async (request: ToggleFavoriteRequest) => {
			// Get user ID from auth token
			const token = getAuthToken();
			if (!token) {
				throw new Error("User is not authenticated");
			}

			const userId = getUserIdFromToken(token);
			if (!userId) {
				throw new Error("Unable to extract user_id from authentication token");
			}

			const orm = FavoriteORM.getInstance();

			// Check if the restaurant is already favorited
			const existingFavorites = await orm.getFavoriteByRestaurantIdUserId(
				request.restaurant_id,
				userId,
			);

			let action: "added" | "removed";

			if (existingFavorites.length > 0) {
				// Remove from favorites
				await orm.deleteFavoriteByRestaurantIdUserId(
					request.restaurant_id,
					userId,
				);
				action = "removed";
			} else {
				// Add to favorites
				await orm.insertFavorite([
					{
						user_id: userId,
						restaurant_id: request.restaurant_id,
						// Backend will auto-fill: id, data_creator, data_updater, create_time, update_time
					} as FavoriteModel,
				]);
				action = "added";
			}

			// Fetch updated favorites list
			const allFavorites = await orm.getFavoriteByUserId(userId);
			const restaurantIds = allFavorites.map((record) => record.restaurant_id);

			return {
				status: "Success",
				action,
				restaurant_id: request.restaurant_id,
				favorites: restaurantIds,
				count: restaurantIds.length,
			};
		},

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
