/**
 * User Favorites API - Usage Examples
 *
 * This file demonstrates how to use the User Favorites API endpoints
 * in various scenarios.
 */

import {
	addToFavorites,
	getFavorites,
	isFavorite,
	removeFromFavorites,
	toggleFavorite,
} from "./user-favorites";

// ==================== Example 1: Fetch User's Favorites ====================

/**
 * Example: Get all favorited restaurants
 */
async function example1_GetFavorites() {
	try {
		const favoritesData = await getFavorites();

		console.log(`You have ${favoritesData.count} favorites:`);
		console.log(favoritesData.favorites);
		// Output:
		// You have 3 favorites:
		// ["noodles-0-annaba", "sushi-palace-tokyo", "burger-king-paris"]
	} catch (error) {
		console.error("Failed to fetch favorites:", error);
	}
}

// ==================== Example 2: Toggle Favorite ====================

/**
 * Example: Toggle a restaurant in favorites (add if not present, remove if present)
 */
async function example2_ToggleFavorite() {
	const restaurantId = "noodles-0-annaba";

	try {
		const result = await toggleFavorite({ restaurant_id: restaurantId });

		if (result.action === "added") {
			console.log(`✅ Added "${restaurantId}" to favorites!`);
		} else {
			console.log(`❌ Removed "${restaurantId}" from favorites!`);
		}

		console.log(`Total favorites: ${result.count}`);
		console.log("All favorites:", result.favorites);
	} catch (error) {
		console.error("Failed to toggle favorite:", error);
	}
}

// ==================== Example 3: Check if Restaurant is Favorited ====================

/**
 * Example: Check if a specific restaurant is in favorites
 */
async function example3_CheckFavorite() {
	const restaurantId = "noodles-0-annaba";

	try {
		const favorited = await isFavorite(restaurantId);

		if (favorited) {
			console.log(`❤️ "${restaurantId}" is in your favorites!`);
		} else {
			console.log(`🤍 "${restaurantId}" is not in your favorites.`);
		}
	} catch (error) {
		console.error("Failed to check favorite status:", error);
	}
}

// ==================== Example 4: Add to Favorites (Idempotent) ====================

/**
 * Example: Add a restaurant to favorites (won't duplicate if already present)
 */
async function example4_AddToFavorites() {
	const restaurantId = "sushi-palace-tokyo";

	try {
		const result = await addToFavorites(restaurantId);

		console.log(`Restaurant added! Total favorites: ${result.count}`);
		console.log("All favorites:", result.favorites);
	} catch (error) {
		console.error("Failed to add to favorites:", error);
	}
}

// ==================== Example 5: Remove from Favorites ====================

/**
 * Example: Remove a restaurant from favorites
 */
async function example5_RemoveFromFavorites() {
	const restaurantId = "burger-king-paris";

	try {
		const result = await removeFromFavorites(restaurantId);

		console.log(`Restaurant removed! Total favorites: ${result.count}`);
		console.log("Remaining favorites:", result.favorites);
	} catch (error) {
		console.error("Failed to remove from favorites:", error);
	}
}

// ==================== Example 6: Complete Workflow ====================

/**
 * Example: Complete workflow - fetch, toggle, and verify
 */
async function example6_CompleteWorkflow() {
	const restaurantId = "noodles-0-annaba";

	try {
		// Step 1: Get current favorites
		console.log("=== Step 1: Current Favorites ===");
		const currentFavorites = await getFavorites();
		console.log(`Current count: ${currentFavorites.count}`);
		console.log("Favorites:", currentFavorites.favorites);

		// Step 2: Check if restaurant is favorited
		console.log("\n=== Step 2: Check Status ===");
		const isCurrentlyFavorited = await isFavorite(restaurantId);
		console.log(
			`Is "${restaurantId}" favorited?`,
			isCurrentlyFavorited ? "Yes ❤️" : "No 🤍",
		);

		// Step 3: Toggle favorite
		console.log("\n=== Step 3: Toggle Favorite ===");
		const toggleResult = await toggleFavorite({ restaurant_id: restaurantId });
		console.log(`Action: ${toggleResult.action}`);
		console.log(`New count: ${toggleResult.count}`);

		// Step 4: Verify the change
		console.log("\n=== Step 4: Verify Change ===");
		const updatedFavorites = await getFavorites();
		console.log(`Updated count: ${updatedFavorites.count}`);
		console.log("Updated favorites:", updatedFavorites.favorites);
	} catch (error) {
		console.error("Workflow failed:", error);
	}
}

// ==================== React Component Example ====================

/**
 * Example: How to use in a React component (pseudo-code)
 */
/*
import { useFavorites, useToggleFavorite, useIsFavorite } from "@/hooks/use-favorites";

function FavoriteButton({ restaurantId }: { restaurantId: string }) {
  const { isFavorited, isLoading } = useIsFavorite(restaurantId);
  const { mutate: toggleFavorite, isPending } = useToggleFavorite({
    onSuccess: (data) => {
      console.log(`Favorite ${data.action}!`);
    },
    onError: (error) => {
      console.error("Failed to toggle favorite:", error);
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <button
      onClick={() => toggleFavorite({ restaurant_id: restaurantId })}
      disabled={isPending}
    >
      {isFavorited ? "❤️ Favorited" : "🤍 Favorite"}
    </button>
  );
}

function FavoritesList() {
  const { data, isLoading, error } = useFavorites();

  if (isLoading) return <div>Loading favorites...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>My Favorites ({data.count})</h2>
      <ul>
        {data.favorites.map(id => (
          <li key={id}>{id}</li>
        ))}
      </ul>
    </div>
  );
}

function FavoritesManager() {
  const {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorited,
    isPending,
    favoritesCount
  } = useFavoritesManager();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Manage Favorites ({favoritesCount})</h2>
      <button
        onClick={() => toggleFavorite("noodles-0-annaba")}
        disabled={isPending}
      >
        {isFavorited("noodles-0-annaba") ? "Remove" : "Add"} Noodles
      </button>
    </div>
  );
}
*/

// Export examples for testing
export {
	example1_GetFavorites,
	example2_ToggleFavorite,
	example3_CheckFavorite,
	example4_AddToFavorites,
	example5_RemoveFromFavorites,
	example6_CompleteWorkflow,
};
