import type {
	LocationState,
	Restaurant,
	Review,
} from "@/store/restaurant-search-store";

// Location data structure
interface LocationData {
	[country: string]: {
		[state: string]: string[];
	};
}

// Comprehensive global location data with all major countries, states/provinces, and cities
// This is a subset - in production this would come from an API
export const LOCATION_DATA: LocationData = {
	"United States": {
		California: [
			"Los Angeles",
			"San Francisco",
			"San Diego",
			"Sacramento",
			"San Jose",
		],
		"New York": ["New York City", "Buffalo", "Rochester", "Albany"],
		Texas: ["Houston", "Dallas", "Austin", "San Antonio"],
		Florida: ["Miami", "Orlando", "Tampa", "Jacksonville"],
	},
	France: {
		"Île-de-France": ["Paris", "Versailles"],
		"Provence-Alpes-Côte d'Azur": ["Marseille", "Nice", "Cannes"],
	},
	Japan: {
		Kanto: ["Tokyo", "Yokohama"],
		Kansai: ["Osaka", "Kyoto", "Kobe"],
	},
	// Add more as needed
};

/**
 * Helper function to calculate distance between two coordinates (in miles)
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
 * Helper function to check if restaurant is open now
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
 * Generate mock reviews
 */
function generateMockReviews(count: number): Review[] {
	const comments = [
		"Amazing food and great service!",
		"A bit crowded but worth the wait.",
		"Excellent atmosphere and delicious dishes.",
		"Perfect spot for a quick meal.",
		"The best place I've tried in this area!",
	];

	const authors = ["John D.", "Sarah M.", "Michael K.", "Emma L.", "David P."];

	return Array.from({ length: count }, (_, i) => ({
		id: `review-${i}`,
		author: authors[i % authors.length],
		rating: 3 + Math.random() * 2,
		comment: comments[i % comments.length],
		date: new Date(
			Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
		).toLocaleDateString(),
	}));
}

/**
 * Search restaurants based on location and selected categories
 *
 * This is a mock implementation. In production, this would call the actual API.
 */
export function searchRestaurants(
	location: LocationState,
	selectedCategories: string[],
): Restaurant[] {
	const restaurantNames: Record<string, string[]> = {
		Noodles: [
			"Noodle House",
			"Ramen Paradise",
			"Pho Station",
			"Udon Express",
			"Noodle Bar",
		],
		Vegetarian: [
			"Green Leaf Cafe",
			"Veggie Delight",
			"Plant Power",
			"The Garden Table",
			"Herbivore Haven",
		],
		Healthy: [
			"Fresh Bowl",
			"Nutrition Kitchen",
			"Wellness Cafe",
			"Clean Eats",
			"Health Hub",
		],
		"Fast-Food": [
			"Quick Bites",
			"Express Grill",
			"Speedy Diner",
			"Fast Fresh",
			"Rapid Eats",
		],
		"Best Tourist Spot": [
			"Landmark Bistro",
			"Heritage Kitchen",
			"City View Restaurant",
			"Tourist's Choice",
			"Famous Fare",
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
	};

	const restaurants: Restaurant[] = [];
	const categoriesToUse =
		selectedCategories.length > 0
			? selectedCategories
			: ["Noodles", "Vegetarian", "Healthy", "Fast-Food", "Best Tourist Spot"];

	// Generate operating hours (some restaurants open/closed)
	const hourOptions = [
		{ open: "08:00", close: "22:00" },
		{ open: "09:00", close: "21:00" },
		{ open: "10:00", close: "23:00" },
		{ open: "11:00", close: "20:00" },
		{ open: "07:00", close: "15:00" }, // Breakfast spot
		{ open: "17:00", close: "02:00" }, // Late night spot
	];

	for (const category of categoriesToUse) {
		const names = restaurantNames[category] || ["Generic Restaurant"];
		for (let index = 0; index < names.length; index++) {
			const name = names[index];
			const rating = 3.5 + Math.random() * 1.5;
			const reviewCount = Math.floor(50 + Math.random() * 450);
			const restaurantLat =
				(location.latitude || 40.7128) + (Math.random() - 0.5) * 0.1;
			const restaurantLon =
				(location.longitude || -74.006) + (Math.random() - 0.5) * 0.1;
			const hours = hourOptions[Math.floor(Math.random() * hourOptions.length)];

			const distance = location.latitude
				? calculateDistance(
						location.latitude,
						location.longitude || -74.006,
						restaurantLat,
						restaurantLon,
					)
				: Math.random() * 10; // Random distance up to 10 miles

			restaurants.push({
				id: `${category}-${index}`,
				name: `${name} - ${location.city}`,
				address: {
					street: `${100 + index * 10} Main Street`,
					city: location.city,
					state: location.state,
					country: location.country,
					zipCode: `${10000 + index * 100}`,
				},
				rating: Math.round(rating * 10) / 10,
				reviewCount,
				categories: [category],
				priceRange: Math.ceil(Math.random() * 4),
				description: descriptions[category] || "A wonderful dining experience.",
				latitude: restaurantLat,
				longitude: restaurantLon,
				reviews: generateMockReviews(3),
				distance: Math.round(distance * 10) / 10,
				hours,
				isOpenNow: isRestaurantOpen(hours),
			});
		}
	}

	return restaurants;
}

/**
 * Helper function to find country and state for a given city
 */
export function findLocationForCity(cityName: string): LocationState | null {
	for (const [country, states] of Object.entries(LOCATION_DATA)) {
		for (const [state, cities] of Object.entries(states)) {
			if (cities.includes(cityName)) {
				return { country, state, city: cityName };
			}
		}
	}
	return null;
}

/**
 * Get list of countries
 */
export function getCountries(): string[] {
	return Object.keys(LOCATION_DATA).sort();
}

/**
 * Get list of states for a country
 */
export function getStates(country: string): string[] {
	if (!country || !LOCATION_DATA[country]) return [];
	return Object.keys(LOCATION_DATA[country]).sort();
}

/**
 * Get list of cities for a country and state
 */
export function getCities(country: string, state: string): string[] {
	if (!country || !state || !LOCATION_DATA[country]?.[state]) return [];
	return [...LOCATION_DATA[country][state]].sort();
}
