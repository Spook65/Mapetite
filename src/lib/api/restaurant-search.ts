/**
 * Restaurant Search API Types and Mock Implementation
 *
 * This file provides TypeScript types and a mock implementation for the
 * /api/restaurants/search endpoint with filter support.
 */

// API Request Parameters
export interface RestaurantSearchParams {
	/** Filter by city name (e.g., "Annaba") */
	city?: string;

	/** Filter by cuisine type (e.g., "Noodles", "Vegetarian") */
	cuisine?: string;

	/** Filter by minimum rating (e.g., 4.0) */
	rating?: number;

	/** Filter by country (optional) */
	country?: string;

	/** Filter by state/province (optional) */
	state?: string;

	/** Filter by price range (1-4, where 1=$, 4=$$$$) */
	priceRange?: number | number[];

	/** Filter to show only open restaurants */
	isOpen?: boolean;

	/** Maximum distance in miles (optional) */
	maxDistance?: number;

	/** Sort results by field */
	sortBy?: "rating" | "distance" | "reviewCount" | "name";

	/** Sort order */
	sortOrder?: "asc" | "desc";

	/** Limit number of results */
	limit?: number;

	/** Offset for pagination */
	offset?: number;
}

// API Response Types
export interface RestaurantSearchResult {
	/** Unique restaurant identifier */
	id: string;

	/** Restaurant name */
	name: string;

	/** Overall rating (0-5) */
	rating: number;

	/** Total number of reviews */
	review_count: number;

	/** Price range indicator (1-4, where 1=$, 4=$$$$) */
	pricing: number;

	/** URL to restaurant photo */
	photo_url: string;

	/** Whether restaurant is currently open */
	is_open: boolean;

	/** Restaurant address */
	address: {
		street: string;
		city: string;
		state: string;
		country: string;
		zipCode: string;
	};

	/** Restaurant location coordinates */
	coordinates: {
		latitude: number;
		longitude: number;
	};

	/** Cuisine categories */
	categories: string[];

	/** Operating hours */
	hours?: {
		open: string;
		close: string;
	};

	/** Distance from search location (in miles, optional) */
	distance?: number;

	/** Short description */
	description?: string;
}

export interface RestaurantSearchResponse {
	/** Total number of results matching the query */
	total: number;

	/** Array of restaurant results */
	results: RestaurantSearchResult[];

	/** Applied filters for reference */
	filters: RestaurantSearchParams;

	/** Timestamp of the search */
	timestamp: string;
}

/**
 * Mock data generator for restaurant photos
 * In a real implementation, these would be actual image URLs
 */
function generatePhotoUrl(restaurantId: string): string {
	// Mock photo URLs - in production, these would be real image URLs
	const photoPatterns = [
		`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&id=${restaurantId}`,
		`https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop&id=${restaurantId}`,
		`https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop&id=${restaurantId}`,
		`https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&id=${restaurantId}`,
		`https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=400&h=300&fit=crop&id=${restaurantId}`,
	];

	// Use hash of ID to consistently select a photo pattern
	const hash = restaurantId
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return photoPatterns[hash % photoPatterns.length];
}

/**
 * Helper function to check if restaurant is currently open
 */
function isRestaurantOpen(hours: { open: string; close: string }): boolean {
	const now = new Date();
	const currentTime = now.getHours() * 60 + now.getMinutes();

	const [openHour, openMin] = hours.open.split(":").map(Number);
	const [closeHour, closeMin] = hours.close.split(":").map(Number);

	const openTime = openHour * 60 + openMin;
	const closeTime = closeHour * 60 + closeMin;

	// Handle cases where closing time is after midnight
	if (closeTime < openTime) {
		return currentTime >= openTime || currentTime <= closeTime;
	}

	return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * Calculate distance between two coordinates (in miles)
 */
function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 3959; // Earth's radius in miles
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

/**
 * Mock implementation of /api/restaurants/search endpoint
 *
 * In a production environment, this would make an actual HTTP request
 * to a backend API. For demonstration purposes, this generates mock data.
 *
 * @param params - Search and filter parameters
 * @returns Promise resolving to search results
 */
export async function searchRestaurants(
	params: RestaurantSearchParams,
): Promise<RestaurantSearchResponse> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	// Mock restaurant data
	const restaurantNames: Record<string, string[]> = {
		Noodles: [
			"Noodle House",
			"Ramen Paradise",
			"Pho Station",
			"Udon Express",
			"Noodle Bar",
			"Tokyo Ramen",
			"Saigon Pho House",
			"Shanghai Noodle Kitchen",
		],
		Vegetarian: [
			"Green Leaf Cafe",
			"Veggie Delight",
			"Plant Power",
			"The Garden Table",
			"Herbivore Haven",
			"Pure Greens",
			"Veggie Paradise",
			"Plant Based Kitchen",
		],
		Healthy: [
			"Fresh Bowl",
			"Nutrition Kitchen",
			"Wellness Cafe",
			"Clean Eats",
			"Health Hub",
			"Vitality Kitchen",
			"Wholesome Dining",
			"Nourish Cafe",
		],
		"Fast-Food": [
			"Quick Bites",
			"Express Grill",
			"Speedy Diner",
			"Fast Fresh",
			"Rapid Eats",
			"Lightning Burger",
			"Fast Lane Diner",
			"Quick Stop Grill",
		],
		"Best Tourist Spot": [
			"Landmark Bistro",
			"Heritage Kitchen",
			"City View Restaurant",
			"Tourist's Choice",
			"Famous Fare",
			"Iconic Eats",
			"Destination Dining",
			"Travelers Table",
		],
		Italian: [
			"La Trattoria",
			"Pasta Palace",
			"Roma Kitchen",
			"Venice Bistro",
			"Tuscany Table",
		],
		Mexican: [
			"El Mariachi",
			"Tacos & Tequila",
			"Casa Mexico",
			"Fiesta Cantina",
			"Salsa Verde",
		],
		Chinese: [
			"Golden Dragon",
			"Peking Palace",
			"Dynasty Kitchen",
			"Szechuan Express",
			"Wok & Roll",
		],
		Japanese: [
			"Sakura Sushi",
			"Tokyo Kitchen",
			"Zen Garden",
			"Samurai Grill",
			"Wasabi House",
		],
		Indian: [
			"Taj Mahal",
			"Curry House",
			"Bombay Palace",
			"Spice Route",
			"Delhi Darbar",
		],
	};

	const descriptions: Record<string, string> = {
		Noodles:
			"Authentic noodle dishes with traditional recipes and fresh ingredients.",
		Vegetarian:
			"Plant-based cuisine that celebrates vegetables and wholesome ingredients.",
		Healthy: "Nutritious meals designed for health-conscious diners.",
		"Fast-Food": "Quick and satisfying meals perfect for on-the-go dining.",
		"Best Tourist Spot":
			"A must-visit destination known for exceptional food and atmosphere.",
		Italian:
			"Traditional Italian cuisine with homemade pasta and authentic flavors.",
		Mexican: "Vibrant Mexican dishes with bold flavors and fresh ingredients.",
		Chinese: "Classic Chinese cuisine with regional specialties and dim sum.",
		Japanese:
			"Authentic Japanese cuisine featuring sushi, ramen, and traditional dishes.",
		Indian:
			"Aromatic Indian curries and tandoori specialties with authentic spices.",
	};

	// Operating hours options
	const hourOptions = [
		{ open: "08:00", close: "22:00" },
		{ open: "09:00", close: "21:00" },
		{ open: "10:00", close: "23:00" },
		{ open: "11:00", close: "20:00" },
		{ open: "07:00", close: "15:00" }, // Breakfast spot
		{ open: "17:00", close: "02:00" }, // Late night spot
		{ open: "10:00", close: "22:00" },
		{ open: "11:30", close: "23:30" },
	];

	// Generate mock restaurants
	const allResults: RestaurantSearchResult[] = [];
	const categoriesToUse = params.cuisine
		? [params.cuisine]
		: Object.keys(restaurantNames);

	// Default coordinates (e.g., Annaba, Algeria)
	const baseLat = 36.9;
	const baseLon = 7.7667;

	for (const category of categoriesToUse) {
		const names = restaurantNames[category] || ["Generic Restaurant"];

		for (let index = 0; index < names.length; index++) {
			const name = names[index];
			const rating = 3.0 + Math.random() * 2.0; // 3.0 - 5.0
			const reviewCount = Math.floor(20 + Math.random() * 500);
			const pricing = Math.ceil(Math.random() * 4);
			const hours = hourOptions[Math.floor(Math.random() * hourOptions.length)];
			const isOpen = isRestaurantOpen(hours);

			const restaurantLat = baseLat + (Math.random() - 0.5) * 0.1;
			const restaurantLon = baseLon + (Math.random() - 0.5) * 0.1;
			const distance = calculateDistance(
				baseLat,
				baseLon,
				restaurantLat,
				restaurantLon,
			);

			const city = params.city || "Annaba";
			const state = params.state || "Annaba Province";
			const country = params.country || "Algeria";

			const restaurant: RestaurantSearchResult = {
				id: `${category.toLowerCase().replace(/\s+/g, "-")}-${index}-${city.toLowerCase()}`,
				name: `${name} - ${city}`,
				rating: Math.round(rating * 10) / 10,
				review_count: reviewCount,
				pricing,
				photo_url: generatePhotoUrl(`${category}-${index}`),
				is_open: isOpen,
				address: {
					street: `${100 + index * 10} Main Street`,
					city,
					state,
					country,
					zipCode: `${23000 + index * 10}`,
				},
				coordinates: {
					latitude: restaurantLat,
					longitude: restaurantLon,
				},
				categories: [category],
				hours,
				distance: Math.round(distance * 10) / 10,
				description: descriptions[category] || "A wonderful dining experience.",
			};

			allResults.push(restaurant);
		}
	}

	// Apply filters
	let filteredResults = allResults;

	// Filter by city
	if (params.city) {
		const searchCity = params.city.toLowerCase();
		filteredResults = filteredResults.filter((r) =>
			r.address.city.toLowerCase().includes(searchCity),
		);
	}

	// Filter by rating
	if (params.rating !== undefined) {
		const minRating = params.rating;
		filteredResults = filteredResults.filter((r) => r.rating >= minRating);
	}

	// Filter by cuisine (already handled in generation, but double-check)
	if (params.cuisine) {
		const searchCuisine = params.cuisine.toLowerCase();
		filteredResults = filteredResults.filter((r) =>
			r.categories.some((cat) => cat.toLowerCase().includes(searchCuisine)),
		);
	}

	// Filter by price range
	if (params.priceRange !== undefined) {
		const priceRanges = Array.isArray(params.priceRange)
			? params.priceRange
			: [params.priceRange];
		filteredResults = filteredResults.filter((r) =>
			priceRanges.includes(r.pricing),
		);
	}

	// Filter by open status
	if (params.isOpen === true) {
		filteredResults = filteredResults.filter((r) => r.is_open);
	}

	// Filter by maximum distance
	if (params.maxDistance !== undefined) {
		const maxDist = params.maxDistance;
		filteredResults = filteredResults.filter(
			(r) => r.distance !== undefined && r.distance <= maxDist,
		);
	}

	// Apply sorting
	if (params.sortBy) {
		const sortOrder = params.sortOrder || "asc";
		const multiplier = sortOrder === "asc" ? 1 : -1;

		filteredResults.sort((a, b) => {
			switch (params.sortBy) {
				case "rating":
					return (a.rating - b.rating) * multiplier;
				case "distance":
					return ((a.distance || 0) - (b.distance || 0)) * multiplier;
				case "reviewCount":
					return (a.review_count - b.review_count) * multiplier;
				case "name":
					return a.name.localeCompare(b.name) * multiplier;
				default:
					return 0;
			}
		});
	}

	// Apply pagination
	const offset = params.offset || 0;
	const limit = params.limit || filteredResults.length;
	const paginatedResults = filteredResults.slice(offset, offset + limit);

	return {
		total: filteredResults.length,
		results: paginatedResults,
		filters: params,
		timestamp: new Date().toISOString(),
	};
}

/**
 * Example usage:
 *
 * ```typescript
 * // Search for restaurants in Annaba with Noodles cuisine and rating >= 4.0
 * const response = await searchRestaurants({
 *   city: "Annaba",
 *   cuisine: "Noodles",
 *   rating: 4.0,
 *   sortBy: "rating",
 *   sortOrder: "desc",
 * });
 *
 * console.log(`Found ${response.total} restaurants`);
 * response.results.forEach(restaurant => {
 *   console.log(`${restaurant.name}: ${restaurant.rating}/5 (${restaurant.review_count} reviews)`);
 * });
 * ```
 */
