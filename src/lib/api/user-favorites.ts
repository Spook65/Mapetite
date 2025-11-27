/**
 * User Favorites API Types and Implementation
 *
 * This file provides TypeScript types and implementation for the
 * /api/user/favorites endpoint to manage user's favorited restaurants.
 *
 * Supports:
 * - GET: Fetch user's list of favorited restaurant IDs
 * - POST: Toggle adding/removing a restaurant from favorites
 */

import { authenticatedFetch, getAuthToken } from "@/lib/auth-integration";
import { getUserIdFromToken } from "@/lib/jwt-utils";

const API_BASE_URL = "http://localhost:3000";

// ==================== GET /api/user/favorites ====================

/**
 * Response type for GET /api/user/favorites
 */
export interface GetFavoritesResponse {
	/** Array of restaurant IDs that the user has favorited */
	favorites: string[];

	/** Total count of favorites */
	count: number;

	/** Timestamp when the list was last updated */
	last_updated?: string;
}

/**
 * Fetch the authenticated user's list of favorited restaurants
 *
 * @returns Promise resolving to the user's favorites list
 * @throws Error if user is not authenticated or request fails
 *
 * @example
 * ```typescript
 * const favoritesData = await getFavorites();
 * console.log(`You have ${favoritesData.count} favorites:`, favoritesData.favorites);
 * ```
 */
export async function getFavorites(): Promise<GetFavoritesResponse> {
	// Extract user_id from JWT token
	const token = getAuthToken();
	if (!token) {
		throw new Error("User is not authenticated");
	}

	const userId = getUserIdFromToken(token);
	if (!userId) {
		throw new Error("Unable to extract user_id from authentication token");
	}

	// Include user_id in query parameters
	const url = new URL(`${API_BASE_URL}/api/user/favorites`);
	url.searchParams.set("user_id", userId);

	const response = await authenticatedFetch(url.toString(), {
		method: "GET",
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			errorData.message || `Failed to fetch favorites: ${response.statusText}`,
		);
	}

	return response.json();
}

// ==================== POST /api/user/favorites ====================

/**
 * Request type for POST /api/user/favorites
 */
export interface ToggleFavoriteRequest {
	/** Restaurant ID to add or remove from favorites */
	restaurant_id: string;
}

/**
 * Response type for POST /api/user/favorites
 */
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

/**
 * Toggle a restaurant in the user's favorites list
 *
 * - If the restaurant is NOT in favorites, it will be ADDED
 * - If the restaurant IS in favorites, it will be REMOVED
 *
 * @param request - Request containing the restaurant_id to toggle
 * @returns Promise resolving to the updated favorites state
 * @throws Error if user is not authenticated or request fails
 *
 * @example
 * ```typescript
 * // Add to favorites
 * const result = await toggleFavorite({ restaurant_id: "noodles-0-annaba" });
 * if (result.action === "added") {
 *   console.log("Added to favorites!");
 * }
 *
 * // Remove from favorites (call again with same ID)
 * const result2 = await toggleFavorite({ restaurant_id: "noodles-0-annaba" });
 * if (result2.action === "removed") {
 *   console.log("Removed from favorites!");
 * }
 * ```
 */
export async function toggleFavorite(
	request: ToggleFavoriteRequest,
): Promise<ToggleFavoriteResponse> {
	// Extract user_id from JWT token
	const token = getAuthToken();
	if (!token) {
		throw new Error("User is not authenticated");
	}

	const userId = getUserIdFromToken(token);
	if (!userId) {
		throw new Error("Unable to extract user_id from authentication token");
	}

	// Include user_id in request body
	const requestBody = {
		...request,
		user_id: userId,
	};

	const response = await authenticatedFetch(
		`${API_BASE_URL}/api/user/favorites`,
		{
			method: "POST",
			body: JSON.stringify(requestBody),
		},
	);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			errorData.message || `Failed to toggle favorite: ${response.statusText}`,
		);
	}

	return response.json();
}

// ==================== Helper Functions ====================

/**
 * Check if a restaurant is in the user's favorites
 *
 * @param restaurantId - Restaurant ID to check
 * @returns Promise resolving to true if restaurant is favorited, false otherwise
 *
 * @example
 * ```typescript
 * const isFavorited = await isFavorite("noodles-0-annaba");
 * console.log(isFavorited ? "❤️ Favorited" : "🤍 Not favorited");
 * ```
 */
export async function isFavorite(restaurantId: string): Promise<boolean> {
	const data = await getFavorites();
	return data.favorites.includes(restaurantId);
}

/**
 * Add a restaurant to favorites (if not already favorited)
 *
 * @param restaurantId - Restaurant ID to add
 * @returns Promise resolving to the updated favorites response
 *
 * @example
 * ```typescript
 * const result = await addToFavorites("noodles-0-annaba");
 * console.log(`Total favorites: ${result.count}`);
 * ```
 */
export async function addToFavorites(
	restaurantId: string,
): Promise<ToggleFavoriteResponse> {
	const isCurrentlyFavorited = await isFavorite(restaurantId);

	if (isCurrentlyFavorited) {
		// Already favorited, return current state without toggling
		const currentFavorites = await getFavorites();
		return {
			status: "Success",
			action: "added",
			restaurant_id: restaurantId,
			favorites: currentFavorites.favorites,
			count: currentFavorites.count,
			message: "Restaurant is already in favorites",
		};
	}

	// Not favorited yet, toggle to add
	return toggleFavorite({ restaurant_id: restaurantId });
}

/**
 * Remove a restaurant from favorites (if currently favorited)
 *
 * @param restaurantId - Restaurant ID to remove
 * @returns Promise resolving to the updated favorites response
 *
 * @example
 * ```typescript
 * const result = await removeFromFavorites("noodles-0-annaba");
 * console.log(`Removed! Total favorites: ${result.count}`);
 * ```
 */
export async function removeFromFavorites(
	restaurantId: string,
): Promise<ToggleFavoriteResponse> {
	const isCurrentlyFavorited = await isFavorite(restaurantId);

	if (!isCurrentlyFavorited) {
		// Not favorited, return current state without toggling
		const currentFavorites = await getFavorites();
		return {
			status: "Success",
			action: "removed",
			restaurant_id: restaurantId,
			favorites: currentFavorites.favorites,
			count: currentFavorites.count,
			message: "Restaurant is not in favorites",
		};
	}

	// Currently favorited, toggle to remove
	return toggleFavorite({ restaurant_id: restaurantId });
}
