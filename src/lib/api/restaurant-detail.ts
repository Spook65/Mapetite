/**
 * Restaurant Detail API Types and Mock Implementation
 *
 * This file provides TypeScript types and a mock implementation for the
 * /api/restaurants/:id endpoint with comprehensive restaurant data.
 */

// Signature Dish Type
export interface SignatureDish {
	/** Name of the signature dish */
	name: string;

	/** Estimated price of the dish */
	estimated_price: string;

	/** Optional description of the dish */
	description?: string;

	/** Optional photo URL for the dish */
	photo_url?: string;
}

// Chef Information
export interface ChefInfo {
	/** Chef's full name */
	name: string;

	/** Chef's biography/background */
	bio: string;

	/** Chef's photo URL */
	photo_url?: string;

	/** Years of experience */
	years_of_experience?: number;

	/** Specialties */
	specialties?: string[];
}

// Review Type
export interface Review {
	/** Unique review identifier */
	id: string;

	/** Author name */
	author: string;

	/** Rating (0-5) */
	rating: number;

	/** Review comment */
	comment: string;

	/** Date of review */
	date: string;

	/** Optional author photo */
	author_photo?: string;
}

// Restaurant Detail Response
export interface RestaurantDetailResponse {
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

	/** Main photo URL */
	photo_url: string;

	/** Gallery of additional restaurant images */
	gallery_image_urls: string[];

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

	/** Detailed description */
	description: string;

	/** Chef biography and information */
	chef_bio: ChefInfo;

	/** List of signature dishes */
	signature_dishes: SignatureDish[];

	/** Recent reviews */
	reviews: Review[];

	/** Phone number */
	phone?: string;

	/** Website URL */
	website?: string;

	/** Email address */
	email?: string;

	/** Social media links */
	social_media?: {
		facebook?: string;
		instagram?: string;
		twitter?: string;
	};

	/** Amenities/Features */
	amenities?: string[];

	/** Accepted payment methods */
	payment_methods?: string[];
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
 * Generate mock gallery images
 */
function generateGalleryImages(restaurantId: string, count = 6): string[] {
	const baseImages = [
		"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
		"https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop",
		"https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
		"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
		"https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&h=600&fit=crop",
		"https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&h=600&fit=crop",
		"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
		"https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop",
	];

	const hash = restaurantId
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);

	const images: string[] = [];
	for (let i = 0; i < count; i++) {
		const index = (hash + i) % baseImages.length;
		images.push(`${baseImages[index]}&id=${restaurantId}-${i}`);
	}

	return images;
}

/**
 * Generate mock chef information based on cuisine type
 */
function generateChefInfo(cuisine: string, restaurantName: string): ChefInfo {
	const chefNames: Record<string, string[]> = {
		Noodles: [
			"Chef Takeshi Yamamoto",
			"Chef Li Wei",
			"Chef Nguyen Pham",
			"Chef Kenji Tanaka",
		],
		Vegetarian: [
			"Chef Maya Rodriguez",
			"Chef Priya Sharma",
			"Chef Emma Thompson",
			"Chef Isabella Green",
		],
		Healthy: [
			"Chef Marcus Johnson",
			"Chef Sarah Williams",
			"Chef David Chen",
			"Chef Laura Martinez",
		],
		"Fast-Food": [
			"Chef Mike Anderson",
			"Chef Jake Wilson",
			"Chef Rachel Brown",
			"Chef Tony Garcia",
		],
		Italian: [
			"Chef Giovanni Rossi",
			"Chef Maria Bianchi",
			"Chef Antonio Romano",
			"Chef Lucia Ferrari",
		],
		Mexican: [
			"Chef Carlos Hernandez",
			"Chef Rosa Lopez",
			"Chef Miguel Ramirez",
			"Chef Elena Sanchez",
		],
		Chinese: [
			"Chef Zhang Wei",
			"Chef Wang Fang",
			"Chef Liu Ming",
			"Chef Chen Jing",
		],
		Japanese: [
			"Chef Hiroshi Nakamura",
			"Chef Yuki Sato",
			"Chef Akira Suzuki",
			"Chef Sakura Watanabe",
		],
		Indian: [
			"Chef Rajesh Kumar",
			"Chef Anita Patel",
			"Chef Vikram Singh",
			"Chef Priya Reddy",
		],
	};

	const chefBios: Record<string, string[]> = {
		Noodles: [
			"With over 20 years of experience in traditional noodle-making, Chef {name} brings authentic flavors from Asia to every bowl. Trained in Tokyo's finest ramen shops, the chef has perfected the art of creating rich, flavorful broths and hand-pulled noodles.",
			"A third-generation noodle master, Chef {name} learned the craft from family traditions spanning decades. Specializing in authentic preparation techniques, the chef creates dishes that honor time-tested recipes while embracing modern culinary innovations.",
		],
		Vegetarian: [
			"Chef {name} is a pioneer in plant-based cuisine, having dedicated 15 years to creating innovative vegetarian dishes that challenge perceptions. With a background in nutrition and culinary arts, the chef crafts meals that are both delicious and nutritionally balanced.",
			"Passionate about sustainability and healthy eating, Chef {name} transforms fresh, seasonal vegetables into culinary masterpieces. Trained in multiple cuisines, the chef brings a global perspective to vegetarian cooking.",
		],
		Healthy: [
			"Chef {name} combines culinary expertise with nutritional science to create meals that nourish both body and soul. With certifications in both culinary arts and nutrition, the chef has revolutionized healthy dining experiences.",
			"A wellness advocate and culinary artist, Chef {name} believes that healthy food should never compromise on taste. With years of experience in farm-to-table cooking, the chef sources only the finest organic ingredients.",
		],
		"Fast-Food": [
			"Chef {name} has reimagined fast food by combining speed with quality. With experience in high-volume kitchens and fine dining, the chef creates quick meals that don't sacrifice flavor or freshness.",
			"Specializing in efficient yet delicious cuisine, Chef {name} has perfected the art of quick-service cooking. The chef's innovative techniques ensure every meal is prepared fresh and served fast.",
		],
		Italian: [
			"Trained in the culinary schools of Bologna and Naples, Chef {name} brings authentic Italian flavors to every dish. With 18 years of experience, the chef specializes in handmade pasta and traditional regional recipes.",
			"Chef {name} grew up in a Tuscan kitchen, learning traditional techniques from generations of family cooks. Now bringing those cherished recipes to life, the chef creates authentic Italian experiences with every meal.",
		],
		Mexican: [
			"Chef {name} honors traditional Mexican cooking while adding contemporary flair. Trained in Oaxaca and Mexico City, the chef brings regional specialties and authentic flavors to the table.",
			"With roots in authentic Mexican cuisine, Chef {name} creates vibrant dishes using family recipes passed down through generations. The chef's expertise in mole and traditional preparations is renowned.",
		],
		Chinese: [
			"Chef {name} mastered the art of Chinese cuisine in Shanghai and Sichuan, learning regional specialties and traditional wok techniques. With 22 years of experience, the chef creates authentic flavors with modern presentation.",
			"A master of dim sum and regional Chinese cooking, Chef {name} brings expertise from training in Hong Kong's finest establishments. The chef's dedication to authentic preparation shines in every dish.",
		],
		Japanese: [
			"Chef {name} trained for 12 years in Tokyo, mastering sushi, ramen, and kaiseki cuisine. The chef's dedication to precision and quality has earned recognition across the culinary world.",
			"With certification from the Japan Culinary Institute, Chef {name} brings authentic Japanese techniques and flavors to every creation. The chef's expertise in seasonal ingredients and traditional preparations is unmatched.",
		],
		Indian: [
			"Chef {name} learned traditional Indian cooking from master chefs in Mumbai and Delhi. Specializing in aromatic curries and tandoori preparations, the chef creates authentic flavors using traditional spice blends.",
			"A master of Indian regional cuisines, Chef {name} brings expertise in both North and South Indian cooking. The chef's understanding of spice combinations and traditional techniques creates unforgettable dining experiences.",
		],
	};

	const cuisineType = cuisine || "Healthy";
	const names = chefNames[cuisineType] || chefNames.Healthy;
	const bios = chefBios[cuisineType] || chefBios.Healthy;

	const hash = restaurantName
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const nameIndex = hash % names.length;
	const bioIndex = hash % bios.length;

	const chefName = names[nameIndex];
	const bio = bios[bioIndex].replace("{name}", chefName);

	return {
		name: chefName,
		bio,
		photo_url: `https://i.pravatar.cc/300?img=${(hash % 70) + 1}`,
		years_of_experience: 15 + (hash % 20),
		specialties: [cuisine, "Seasonal Ingredients", "Traditional Techniques"],
	};
}

/**
 * Generate signature dishes based on cuisine type
 */
function generateSignatureDishes(cuisine: string): SignatureDish[] {
	const dishesMap: Record<string, SignatureDish[]> = {
		Noodles: [
			{
				name: "Tonkotsu Ramen",
				estimated_price: "$14.99",
				description:
					"Rich pork bone broth with hand-pulled noodles, soft-boiled egg, and chashu pork",
				photo_url:
					"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
			},
			{
				name: "Dan Dan Noodles",
				estimated_price: "$12.99",
				description: "Spicy Sichuan noodles with minced pork and chili oil",
				photo_url:
					"https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop",
			},
			{
				name: "Pad Thai",
				estimated_price: "$13.99",
				description:
					"Classic Thai stir-fried rice noodles with shrimp, tofu, and tamarind sauce",
				photo_url:
					"https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop",
			},
		],
		Vegetarian: [
			{
				name: "Buddha Bowl",
				estimated_price: "$11.99",
				description:
					"Quinoa, roasted vegetables, chickpeas, and tahini dressing",
				photo_url:
					"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
			},
			{
				name: "Grilled Portobello Steak",
				estimated_price: "$15.99",
				description:
					"Marinated portobello mushroom with herb sauce and seasonal vegetables",
				photo_url:
					"https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop",
			},
			{
				name: "Veggie Sushi Platter",
				estimated_price: "$16.99",
				description:
					"Assorted vegetable rolls with avocado, cucumber, and pickled radish",
				photo_url:
					"https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
			},
		],
		Healthy: [
			{
				name: "Grilled Salmon Bowl",
				estimated_price: "$17.99",
				description:
					"Wild-caught salmon, brown rice, steamed broccoli, and lemon herb sauce",
				photo_url:
					"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
			},
			{
				name: "Kale & Quinoa Salad",
				estimated_price: "$12.99",
				description:
					"Organic kale, quinoa, pomegranate, nuts, and citrus vinaigrette",
				photo_url:
					"https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop",
			},
			{
				name: "Chicken Avocado Wrap",
				estimated_price: "$10.99",
				description:
					"Grilled chicken, avocado, mixed greens in whole wheat tortilla",
				photo_url:
					"https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop",
			},
		],
		"Fast-Food": [
			{
				name: "Classic Burger",
				estimated_price: "$8.99",
				description: "Beef patty, lettuce, tomato, cheese, and special sauce",
				photo_url:
					"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
			},
			{
				name: "Crispy Chicken Sandwich",
				estimated_price: "$7.99",
				description: "Fried chicken, pickles, and spicy mayo on brioche bun",
				photo_url:
					"https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400&h=300&fit=crop",
			},
			{
				name: "Loaded Fries",
				estimated_price: "$6.99",
				description: "Crispy fries topped with cheese, bacon, and ranch",
				photo_url:
					"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop",
			},
		],
		Italian: [
			{
				name: "Spaghetti Carbonara",
				estimated_price: "$16.99",
				description:
					"Fresh pasta with guanciale, egg yolk, Pecorino Romano, and black pepper",
				photo_url:
					"https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop",
			},
			{
				name: "Osso Buco",
				estimated_price: "$28.99",
				description: "Braised veal shanks with gremolata and saffron risotto",
				photo_url:
					"https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400&h=300&fit=crop",
			},
			{
				name: "Margherita Pizza",
				estimated_price: "$14.99",
				description:
					"San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil",
				photo_url:
					"https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
			},
		],
		Mexican: [
			{
				name: "Mole Poblano",
				estimated_price: "$18.99",
				description: "Chicken in rich chocolate-chili sauce with sesame seeds",
				photo_url:
					"https://images.unsplash.com/photo-1599974579688-8dbdd335ca98?w=400&h=300&fit=crop",
			},
			{
				name: "Carne Asada Tacos",
				estimated_price: "$13.99",
				description: "Grilled beef tacos with cilantro, onions, and lime",
				photo_url:
					"https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
			},
			{
				name: "Enchiladas Verdes",
				estimated_price: "$12.99",
				description:
					"Chicken enchiladas with green tomatillo sauce and sour cream",
				photo_url:
					"https://images.unsplash.com/photo-1617343267973-ce28d0b43493?w=400&h=300&fit=crop",
			},
		],
		Chinese: [
			{
				name: "Peking Duck",
				estimated_price: "$32.99",
				description:
					"Crispy roasted duck served with pancakes, scallions, and hoisin sauce",
				photo_url:
					"https://images.unsplash.com/photo-1567629153170-98a1c6e9d8fa?w=400&h=300&fit=crop",
			},
			{
				name: "Mapo Tofu",
				estimated_price: "$11.99",
				description: "Spicy Sichuan tofu with minced pork and chili bean paste",
				photo_url:
					"https://images.unsplash.com/photo-1633237308525-cd587cf71926?w=400&h=300&fit=crop",
			},
			{
				name: "Xiao Long Bao",
				estimated_price: "$9.99",
				description: "Steamed soup dumplings with pork filling",
				photo_url:
					"https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop",
			},
		],
		Japanese: [
			{
				name: "Omakase Sushi",
				estimated_price: "$65.00",
				description: "Chef's selection of premium nigiri and sashimi",
				photo_url:
					"https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
			},
			{
				name: "Wagyu Teppanyaki",
				estimated_price: "$48.99",
				description:
					"A5 Wagyu beef grilled to perfection with seasonal vegetables",
				photo_url:
					"https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
			},
			{
				name: "Kaiseki Course",
				estimated_price: "$85.00",
				description:
					"Traditional multi-course Japanese dinner featuring seasonal ingredients",
				photo_url:
					"https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400&h=300&fit=crop",
			},
		],
		Indian: [
			{
				name: "Butter Chicken",
				estimated_price: "$15.99",
				description:
					"Tender chicken in creamy tomato sauce with aromatic spices",
				photo_url:
					"https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop",
			},
			{
				name: "Lamb Rogan Josh",
				estimated_price: "$18.99",
				description: "Slow-cooked lamb in rich aromatic curry sauce",
				photo_url:
					"https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
			},
			{
				name: "Tandoori Mixed Grill",
				estimated_price: "$22.99",
				description:
					"Assorted meats marinated in yogurt and spices, cooked in clay oven",
				photo_url:
					"https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop",
			},
		],
	};

	const cuisineType = cuisine || "Healthy";
	return dishesMap[cuisineType] || dishesMap.Healthy;
}

/**
 * Generate mock reviews
 */
function generateReviews(count = 5): Review[] {
	const reviewComments = [
		"Absolutely fantastic! The food was delicious and the service was impeccable. Highly recommend!",
		"Amazing atmosphere and wonderful staff. The signature dishes are a must-try!",
		"Great experience overall. Food quality is excellent and portions are generous.",
		"One of the best restaurants in the area. Everything we ordered exceeded expectations.",
		"Beautiful presentation and authentic flavors. Will definitely be coming back!",
		"Outstanding service and incredible food. The chef really knows their craft.",
		"A hidden gem! Every dish was perfectly prepared and full of flavor.",
		"Excellent dining experience from start to finish. Worth every penny!",
		"The ambiance is perfect and the food is absolutely delicious. Can't wait to return!",
		"Consistently great quality. This is our go-to spot for special occasions.",
	];

	const reviewAuthors = [
		"John Mitchell",
		"Sarah Johnson",
		"Michael Chen",
		"Emma Rodriguez",
		"David Thompson",
		"Lisa Anderson",
		"James Wilson",
		"Maria Garcia",
		"Robert Lee",
		"Jennifer Brown",
	];

	const reviews: Review[] = [];
	for (let i = 0; i < count; i++) {
		const rating = 3.5 + Math.random() * 1.5; // 3.5-5.0
		const daysAgo = Math.floor(Math.random() * 90);
		const reviewDate = new Date();
		reviewDate.setDate(reviewDate.getDate() - daysAgo);

		reviews.push({
			id: `review-${i}`,
			author: reviewAuthors[i % reviewAuthors.length],
			rating: Math.round(rating * 2) / 2, // Round to nearest 0.5
			comment: reviewComments[i % reviewComments.length],
			date: reviewDate.toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
			author_photo: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
		});
	}

	return reviews.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);
}

/**
 * Mock implementation of /api/restaurants/:id endpoint
 *
 * This endpoint returns comprehensive restaurant details including:
 * - Gallery images
 * - Chef biography
 * - Signature dishes
 * - Reviews
 * - Contact information
 * - Amenities
 *
 * @param restaurantId - Unique restaurant identifier
 * @returns Promise resolving to detailed restaurant information
 */
export async function getRestaurantDetail(
	restaurantId: string,
): Promise<RestaurantDetailResponse> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 400));

	// Parse restaurant ID to extract information
	// Format: {cuisine}-{index}-{city}
	const parts = restaurantId.split("-");
	const cuisine = parts[0]
		? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
		: "Healthy";
	const index = parts[1] ? Number.parseInt(parts[1], 10) : 0;
	const city = parts.slice(2).join(" ") || "Annaba";

	// Generate consistent data based on ID
	const hash = restaurantId
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);

	const rating = 3.5 + (hash % 15) / 10; // 3.5-5.0
	const reviewCount = 50 + (hash % 450);
	const pricing = 1 + (hash % 4);

	const hourOptions = [
		{ open: "08:00", close: "22:00" },
		{ open: "09:00", close: "21:00" },
		{ open: "10:00", close: "23:00" },
		{ open: "11:00", close: "20:00" },
		{ open: "07:00", close: "15:00" },
		{ open: "17:00", close: "02:00" },
	];

	const hours = hourOptions[hash % hourOptions.length];
	const isOpen = isRestaurantOpen(hours);

	// Base coordinates
	const baseLat = 36.9 + (hash % 100) / 1000;
	const baseLon = 7.7667 + (hash % 100) / 1000;

	// Restaurant names based on cuisine
	const restaurantNames: Record<string, string[]> = {
		Noodles: ["Noodle House", "Ramen Paradise", "Pho Station", "Udon Express"],
		Vegetarian: ["Green Leaf Cafe", "Veggie Delight", "Plant Power"],
		Healthy: ["Fresh Bowl", "Nutrition Kitchen", "Wellness Cafe"],
		"Fast-food": ["Quick Bites", "Express Grill", "Speedy Diner"],
		Italian: ["La Trattoria", "Pasta Palace", "Roma Kitchen"],
		Mexican: ["El Mariachi", "Tacos & Tequila", "Casa Mexico"],
	};

	const names = restaurantNames[cuisine] || ["The Restaurant"];
	const restaurantName = `${names[index % names.length]} - ${city}`;

	// Generate comprehensive restaurant details
	const detail: RestaurantDetailResponse = {
		id: restaurantId,
		name: restaurantName,
		rating: Math.round(rating * 10) / 10,
		review_count: reviewCount,
		pricing,
		photo_url: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&id=${restaurantId}`,
		gallery_image_urls: generateGalleryImages(restaurantId, 8),
		is_open: isOpen,
		address: {
			street: `${100 + index * 10} Main Street`,
			city,
			state: `${city} Province`,
			country: "Algeria",
			zipCode: `${23000 + index * 10}`,
		},
		coordinates: {
			latitude: baseLat,
			longitude: baseLon,
		},
		categories: [cuisine],
		hours,
		distance: Math.round((hash % 100) / 10),
		description: `Experience exceptional ${cuisine.toLowerCase()} cuisine at ${restaurantName}. Our restaurant combines traditional recipes with modern culinary techniques to create unforgettable dining experiences. Each dish is carefully crafted using the finest ingredients, ensuring quality and authenticity in every bite. Whether you're a local or visiting for the first time, our warm atmosphere and attentive service will make you feel right at home.`,
		chef_bio: generateChefInfo(cuisine, restaurantName),
		signature_dishes: generateSignatureDishes(cuisine),
		reviews: generateReviews(8),
		phone: `+213 ${Math.floor((hash % 900) + 100)}-${Math.floor((hash % 9000) + 1000)}`,
		website: `https://www.${restaurantName.toLowerCase().replace(/\s+/g, "")}.com`,
		email: `info@${restaurantName.toLowerCase().replace(/\s+/g, "")}.com`,
		social_media: {
			facebook: `https://facebook.com/${restaurantName.toLowerCase().replace(/\s+/g, "")}`,
			instagram: `https://instagram.com/${restaurantName.toLowerCase().replace(/\s+/g, "")}`,
			twitter: `https://twitter.com/${restaurantName.toLowerCase().replace(/\s+/g, "")}`,
		},
		amenities: [
			"Free WiFi",
			"Outdoor Seating",
			"Wheelchair Accessible",
			"Parking Available",
			"Takeout",
			"Reservations",
			"Private Dining",
			"Catering Services",
		].slice(0, 5 + (hash % 4)),
		payment_methods: [
			"Cash",
			"Credit Cards",
			"Debit Cards",
			"Mobile Payments",
			"Contactless",
		],
	};

	return detail;
}

/**
 * Example usage:
 *
 * ```typescript
 * // Get detailed information for a specific restaurant
 * const restaurantDetail = await getRestaurantDetail("noodles-0-annaba");
 *
 * console.log(`Restaurant: ${restaurantDetail.name}`);
 * console.log(`Rating: ${restaurantDetail.rating}/5 (${restaurantDetail.review_count} reviews)`);
 * console.log(`Chef: ${restaurantDetail.chef_bio.name}`);
 * console.log(`Signature Dishes: ${restaurantDetail.signature_dishes.length}`);
 * console.log(`Gallery Images: ${restaurantDetail.gallery_image_urls.length}`);
 * ```
 */
