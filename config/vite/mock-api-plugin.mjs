/**
 * Mock API Plugin for Vite
 * Provides mock API endpoints for development
 */

// In-memory storage for favorites (per mock user)
const userFavorites = new Map();

// In-memory storage for users and auth tokens
const mockUsers = new Map();
const authTokens = new Map();

// Mock user ID for testing
const MOCK_USER_ID = "mock-user-123";

/**
 * Generate a mock JWT token
 */
function generateMockToken(userId) {
	// Simple mock JWT format: header.payload.signature
	const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
	const exp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
	const iat = Date.now();
	const payload = Buffer.from(JSON.stringify({
		userId,
		exp,
		iat
	})).toString("base64");
	const signature = Buffer.from(`mock-signature-${userId}`).toString("base64");
	const token = `${header}.${payload}.${signature}`;

	console.log("[Mock API] generateMockToken - Generated token for userId:", userId);
	console.log("[Mock API] generateMockToken - Token expires:", new Date(exp));
	console.log("[Mock API] generateMockToken - Token preview:", token.substring(0, 40) + "...");

	return token;
}

/**
 * Validate and decode a mock JWT token
 */
function validateMockToken(token) {
	if (!token) {
		console.error("[Mock API] validateMockToken - No token provided");
		return null;
	}

	try {
		// Remove "Bearer " prefix if present
		const cleanToken = token.replace(/^Bearer\s+/i, "");
		console.log("[Mock API] validateMockToken - Token after Bearer removal:", cleanToken.substring(0, 30) + "...");

		const parts = cleanToken.split(".");
		if (parts.length !== 3) {
			console.error("[Mock API] validateMockToken - Invalid token format (expected 3 parts, got", parts.length + ")");
			return null;
		}

		const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
		console.log("[Mock API] validateMockToken - Decoded payload:", { userId: payload.userId, exp: payload.exp, iat: payload.iat });

		// Check if token is expired
		if (payload.exp && payload.exp < Date.now()) {
			console.error("[Mock API] validateMockToken - Token expired. Exp:", new Date(payload.exp), "Now:", new Date());
			return null;
		}

		console.log("[Mock API] validateMockToken - Token valid for userId:", payload.userId);
		return payload.userId;
	} catch (error) {
		console.error("[Mock API] validateMockToken - Error validating token:", error.message);
		return null;
	}
}

/**
 * Get user by email
 */
function getUserByEmail(email) {
	for (const [userId, user] of mockUsers.entries()) {
		if (user.email === email) {
			return { userId, ...user };
		}
	}
	return null;
}

/**
 * Get user by ID
 */
function getUserById(userId) {
	const user = mockUsers.get(userId);
	return user ? { userId, ...user } : null;
}

/**
 * Get favorites for a user
 */
function getUserFavorites(userId) {
	if (!userFavorites.has(userId)) {
		userFavorites.set(userId, new Set());
	}
	return userFavorites.get(userId);
}

/**
 * @returns {import('vite').Plugin}
 */
export const mockApiPlugin = () => ({
	name: "mock-api-plugin",
	configureServer(server) {
		server.middlewares.use((req, res, next) => {
			// Parse URL
			const url = new URL(req.url, `http://${req.headers.host}`);

			// ==================== AUTH ENDPOINTS ====================

			// Handle POST /api/auth/register
			if (req.method === "POST" && url.pathname === "/api/auth/register") {
				let body = "";
				req.on("data", (chunk) => {
					body += chunk.toString();
				});

				req.on("end", () => {
					try {
						const { email, password, name } = JSON.parse(body);

						// Validate required fields
						if (!email || !password || !name) {
							res.statusCode = 400;
							res.setHeader("Content-Type", "application/json");
							res.end(
								JSON.stringify({
									status: "Failed",
									message: "email, password, and name are required",
								}),
							);
							return;
						}

						// Check if user already exists
						if (getUserByEmail(email)) {
							res.statusCode = 409;
							res.setHeader("Content-Type", "application/json");
							res.end(
								JSON.stringify({
									status: "Failed",
									message: "User with this email already exists",
								}),
							);
							return;
						}

						// Create new user
						const userId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
						mockUsers.set(userId, {
							email,
							password, // In a real app, this would be hashed
							name,
							createdAt: new Date().toISOString(),
						});

						// Initialize empty favorites for the user
						userFavorites.set(userId, new Set());

						// Generate auth token
						const authToken = generateMockToken(userId);

						res.setHeader("Content-Type", "application/json");
						res.statusCode = 200;
						res.end(
							JSON.stringify({
								status: "Success",
								auth_token: authToken,
								user_id: userId,
								name,
								email,
							}),
						);
					} catch (error) {
						res.statusCode = 400;
						res.setHeader("Content-Type", "application/json");
						res.end(
							JSON.stringify({
								status: "Failed",
								message: "Invalid JSON body",
							}),
						);
					}
				});
				return;
			}

			// Handle POST /api/auth/login
			if (req.method === "POST" && url.pathname === "/api/auth/login") {
				let body = "";
				req.on("data", (chunk) => {
					body += chunk.toString();
				});

				req.on("end", () => {
					try {
						const { email, password } = JSON.parse(body);

						// Validate required fields
						if (!email || !password) {
							res.statusCode = 400;
							res.setHeader("Content-Type", "application/json");
							res.end(
								JSON.stringify({
									status: "Failed",
									message: "email and password are required",
								}),
							);
							return;
						}

						// Find user by email
						const user = getUserByEmail(email);

						if (!user || user.password !== password) {
							res.statusCode = 401;
							res.setHeader("Content-Type", "application/json");
							res.end(
								JSON.stringify({
									status: "Failed",
									message: "Invalid email or password",
								}),
							);
							return;
						}

						// Generate auth token
						const authToken = generateMockToken(user.userId);

						res.setHeader("Content-Type", "application/json");
						res.statusCode = 200;
						res.end(
							JSON.stringify({
								status: "Success",
								auth_token: authToken,
								user_id: user.userId,
								name: user.name,
								email: user.email,
							}),
						);
					} catch (error) {
						res.statusCode = 400;
						res.setHeader("Content-Type", "application/json");
						res.end(
							JSON.stringify({
								status: "Failed",
								message: "Invalid JSON body",
							}),
						);
					}
				});
				return;
			}

			// Handle GET /api/user/profile
			if (req.method === "GET" && url.pathname === "/api/user/profile") {
				// Extract auth token from Authorization header
				const authHeader = req.headers.authorization;
				const userId = validateMockToken(authHeader);

				if (!userId) {
					res.statusCode = 401;
					res.setHeader("Content-Type", "application/json");
					res.end(
						JSON.stringify({
							status: "Failed",
							message: "Unauthorized - invalid or missing auth token",
						}),
					);
					return;
				}

				// Get user data
				const user = getUserById(userId);

				if (!user) {
					res.statusCode = 404;
					res.setHeader("Content-Type", "application/json");
					res.end(
						JSON.stringify({
							status: "Failed",
							message: "User not found",
						}),
					);
					return;
				}

				// Get user's favorites
				const favorites = getUserFavorites(userId);
				const favoritesArray = Array.from(favorites);

				res.setHeader("Content-Type", "application/json");
				res.statusCode = 200;
				res.end(
					JSON.stringify({
						status: "Success",
						user_id: user.userId,
						name: user.name,
						email: user.email,
						favorite_restaurant_ids: favoritesArray,
					}),
				);
				return;
			}

			// ==================== FAVORITES ENDPOINTS ====================

			// Only handle /api/user/favorites endpoint
			if (!req.url?.startsWith("/api/user/favorites")) {
				return next();
			}

			// Authentication middleware for favorites endpoints
			const authHeader = req.headers.authorization;

			// ========== DEBUG LOGGING: CONFIRM WHAT SERVER RECEIVES ==========
			console.log("\n========== INCOMING REQUEST DEBUG ==========");
			console.log("[Mock API] Full Authorization header received:");
			console.log("  - Type:", typeof authHeader);
			console.log("  - Value:", authHeader);
			console.log("  - Is undefined?:", authHeader === undefined);
			console.log("  - Is null?:", authHeader === null);
			console.log("  - Is empty string?:", authHeader === "");

			if (authHeader) {
				console.log("  - Starts with 'Bearer '?:", authHeader.startsWith("Bearer "));
				console.log("  - Length:", authHeader.length);
				console.log("  - First 50 chars:", authHeader.substring(0, 50));

				// Extract the token part (after "Bearer ")
				const tokenPart = authHeader.replace(/^Bearer\s+/i, "");
				console.log("  - Token after 'Bearer ' removal:");
				console.log("    - Length:", tokenPart.length);
				console.log("    - First 50 chars:", tokenPart.substring(0, 50));
				console.log("    - Has 3 parts (header.payload.signature)?:", tokenPart.split(".").length === 3);
			}
			console.log("==========================================\n");
			// ========== END DEBUG LOGGING ==========

			const userId = validateMockToken(authHeader);

			if (!userId) {
				console.error("[Mock API] Authentication failed - invalid or missing token");
				console.error("[Mock API] Auth header received:", authHeader);
				res.statusCode = 401;
				res.setHeader("Content-Type", "application/json");
				res.end(
					JSON.stringify({
						status: "Failed",
						message: "Unauthorized - invalid or missing auth token",
						debug: {
							headerPresent: !!authHeader,
							headerFormat: authHeader ? authHeader.substring(0, 7) : "N/A"
						}
					}),
				);
				return;
			}

			console.log("[Mock API] Authentication successful - userId:", userId);

			// Handle GET /api/user/favorites
			if (req.method === "GET" && url.pathname === "/api/user/favorites") {
				const favorites = getUserFavorites(userId);
				const favoritesArray = Array.from(favorites);

				console.log(`[Mock API] GET /api/user/favorites - User: ${userId}, Count: ${favoritesArray.length}`);

				res.setHeader("Content-Type", "application/json");
				res.statusCode = 200;
				res.end(
					JSON.stringify({
						favorites: favoritesArray,
						count: favoritesArray.length,
						last_updated: new Date().toISOString(),
					}),
				);
				return;
			}

			// Handle POST /api/user/favorites
			if (req.method === "POST" && url.pathname === "/api/user/favorites") {
				let body = "";
				req.on("data", (chunk) => {
					body += chunk.toString();
				});

				req.on("end", () => {
					try {
						const { restaurant_id } = JSON.parse(body);

						console.log(`[Mock API] POST /api/user/favorites - User: ${userId}, Restaurant: ${restaurant_id}`);

						if (!restaurant_id) {
							res.statusCode = 400;
							res.setHeader("Content-Type", "application/json");
							res.end(
								JSON.stringify({
									status: "Failed",
									message: "restaurant_id is required",
								}),
							);
							return;
						}

						const favorites = getUserFavorites(userId);
						let action;

						if (favorites.has(restaurant_id)) {
							favorites.delete(restaurant_id);
							action = "removed";
						} else {
							favorites.add(restaurant_id);
							action = "added";
						}

						const favoritesArray = Array.from(favorites);

						console.log(`[Mock API] Favorite ${action} - Total favorites: ${favoritesArray.length}`);

						res.setHeader("Content-Type", "application/json");
						res.statusCode = 200;
						res.end(
							JSON.stringify({
								status: "Success",
								action,
								restaurant_id,
								favorites: favoritesArray,
								count: favoritesArray.length,
							}),
						);
					} catch (error) {
						console.error("[Mock API] Error processing favorites request:", error);
						res.statusCode = 400;
						res.setHeader("Content-Type", "application/json");
						res.end(
							JSON.stringify({
								status: "Failed",
								message: "Invalid JSON body",
							}),
						);
					}
				});
				return;
			}

			// Unknown endpoint
			res.statusCode = 404;
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({ error: "Not found" }));
		});
	},
});
