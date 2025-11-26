import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Location State Interface
 */
export interface LocationState {
	country: string;
	state: string;
	city: string;
	latitude?: number;
	longitude?: number;
}

/**
 * Review Interface
 */
export interface Review {
	id: string;
	author: string;
	rating: number;
	comment: string;
	date: string;
}

/**
 * Restaurant Interface
 */
export interface Restaurant {
	id: string;
	name: string;
	address: {
		street: string;
		city: string;
		state: string;
		country: string;
		zipCode: string;
	};
	rating: number;
	reviewCount: number;
	categories: string[];
	priceRange: number; // 1-4 ($, $$, $$$, $$$$)
	description: string;
	latitude: number;
	longitude: number;
	reviews: Review[];
	distance?: number; // Distance in miles from user location
	isOpenNow?: boolean; // Whether the restaurant is currently open
	hours?: {
		open: string;
		close: string;
	};
}

/**
 * Restaurant Search Store State
 *
 * This store manages all search and filter parameters for restaurant searches.
 * State persists across navigation and page reloads.
 */
interface RestaurantSearchState {
	// Location parameters
	location: LocationState;
	setLocation: (location: LocationState) => void;
	updateLocation: (partial: Partial<LocationState>) => void;

	// Search results
	restaurants: Restaurant[];
	setRestaurants: (restaurants: Restaurant[]) => void;

	// Category filters
	selectedCategories: Set<string>;
	toggleCategory: (category: string) => void;
	clearCategories: () => void;

	// Refinement filters
	priceFilter: number[];
	setPriceFilter: (prices: number[]) => void;
	togglePriceFilter: (price: number) => void;

	minRating: number;
	setMinRating: (rating: number) => void;

	sortBy: "distance" | "rating" | "reviews" | "none";
	setSortBy: (sortBy: "distance" | "rating" | "reviews" | "none") => void;

	openNowOnly: boolean;
	setOpenNowOnly: (openNow: boolean) => void;

	// View state
	showFavorites: boolean;
	setShowFavorites: (show: boolean) => void;

	showRefinements: boolean;
	setShowRefinements: (show: boolean) => void;

	showMobileFilters: boolean;
	setShowMobileFilters: (show: boolean) => void;

	// Utility functions
	clearAllFilters: () => void;
	resetStore: () => void;
}

/**
 * Initial state values
 */
const initialState = {
	location: {
		country: "",
		state: "",
		city: "",
	},
	restaurants: [],
	selectedCategories: new Set<string>(),
	priceFilter: [1, 2, 3, 4],
	minRating: 0,
	sortBy: "none" as const,
	openNowOnly: false,
	showFavorites: false,
	showRefinements: false,
	showMobileFilters: false,
};

/**
 * Restaurant Search Store
 *
 * Provides centralized state management for restaurant search and filtering.
 * State is persisted to localStorage and survives page reloads and navigation.
 *
 * @example
 * ```tsx
 * import { useRestaurantSearchStore } from '@/store/restaurant-search-store';
 *
 * function SearchComponent() {
 *   const { location, setLocation, restaurants, priceFilter } = useRestaurantSearchStore();
 *
 *   return (
 *     <div>
 *       <p>Searching in: {location.city}</p>
 *       <p>Found {restaurants.length} restaurants</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useRestaurantSearchStore = create<RestaurantSearchState>()(
	persist(
		(set) => ({
			...initialState,

			// Location setters
			setLocation: (location) => set({ location }),

			updateLocation: (partial) =>
				set((state) => ({
					location: { ...state.location, ...partial },
				})),

			// Restaurant results
			setRestaurants: (restaurants) => set({ restaurants }),

			// Category filters
			toggleCategory: (category) =>
				set((state) => {
					const newCategories = new Set(state.selectedCategories);
					if (newCategories.has(category)) {
						newCategories.delete(category);
					} else {
						newCategories.add(category);
					}
					return { selectedCategories: newCategories };
				}),

			clearCategories: () => set({ selectedCategories: new Set() }),

			// Price filter
			setPriceFilter: (prices) => set({ priceFilter: prices }),

			togglePriceFilter: (price) =>
				set((state) => {
					if (state.priceFilter.includes(price)) {
						return {
							priceFilter: state.priceFilter.filter((p) => p !== price),
						};
					}
					return {
						priceFilter: [...state.priceFilter, price].sort(),
					};
				}),

			// Rating filter
			setMinRating: (rating) => set({ minRating: rating }),

			// Sort
			setSortBy: (sortBy) => set({ sortBy }),

			// Open now filter
			setOpenNowOnly: (openNow) => set({ openNowOnly: openNow }),

			// View state
			setShowFavorites: (show) => set({ showFavorites: show }),
			setShowRefinements: (show) => set({ showRefinements: show }),
			setShowMobileFilters: (show) => set({ showMobileFilters: show }),

			// Utility functions
			clearAllFilters: () =>
				set({
					priceFilter: [1, 2, 3, 4],
					minRating: 0,
					sortBy: "none",
					openNowOnly: false,
				}),

			resetStore: () => set(initialState),
		}),
		{
			name: "restaurant-search-storage", // localStorage key
			// Custom serialization for Set objects
			partialize: (state) => ({
				location: state.location,
				selectedCategories: Array.from(state.selectedCategories),
				priceFilter: state.priceFilter,
				minRating: state.minRating,
				sortBy: state.sortBy,
				openNowOnly: state.openNowOnly,
				showRefinements: state.showRefinements,
				// Don't persist restaurants array (too large), showFavorites, or showMobileFilters
			}),
			// Custom deserialization to restore Set objects
			onRehydrateStorage: () => (state) => {
				if (state) {
					// Convert selectedCategories array back to Set
					state.selectedCategories = new Set(
						state.selectedCategories as unknown as string[],
					);
				}
			},
		},
	),
);

/**
 * Selector hooks for optimized re-renders
 * Use these when you only need specific parts of the state
 */

export const useLocation = () =>
	useRestaurantSearchStore((state) => state.location);

export const useRestaurants = () =>
	useRestaurantSearchStore((state) => state.restaurants);

export const useFilters = () =>
	useRestaurantSearchStore((state) => ({
		priceFilter: state.priceFilter,
		minRating: state.minRating,
		sortBy: state.sortBy,
		openNowOnly: state.openNowOnly,
	}));

export const useCategories = () =>
	useRestaurantSearchStore((state) => state.selectedCategories);
