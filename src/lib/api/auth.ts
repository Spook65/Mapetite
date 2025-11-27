/**
 * User Authentication API Types and Implementation
 *
 * This file provides TypeScript types and implementation for the
 * authentication endpoints to support user registration, login, and profile retrieval.
 *
 * Supports:
 * - POST /api/auth/register: Register a new user
 * - POST /api/auth/login: Login an existing user
 * - GET /api/user/profile: Get the authenticated user's profile
 */

const API_BASE_URL = "http://localhost:3000";

// ==================== POST /api/auth/register ====================

/**
 * Request type for POST /api/auth/register
 */
export interface RegisterRequest {
	/** User's email address */
	email: string;

	/** User's password */
	password: string;

	/** User's full name */
	name: string;
}

/**
 * Response type for POST /api/auth/register
 */
export interface RegisterResponse {
	/** Status of the registration */
	status: "Success" | "Failed";

	/** JWT authentication token */
	auth_token: string;

	/** Unique user identifier */
	user_id: string;

	/** User's name */
	name: string;

	/** User's email */
	email: string;

	/** Optional error message (if status is "Failed") */
	message?: string;
}

/**
 * Register a new user account
 *
 * @param request - Registration data containing email, password, and name
 * @returns Promise resolving to the registration response with auth token
 * @throws Error if registration fails or request is invalid
 *
 * @example
 * ```typescript
 * const response = await registerUser({
 *   email: "user@example.com",
 *   password: "securePassword123",
 *   name: "John Doe"
 * });
 * console.log(`Welcome ${response.name}! Your token: ${response.auth_token}`);
 * ```
 */
export async function registerUser(
	request: RegisterRequest,
): Promise<RegisterResponse> {
	const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(
			data.message || `Registration failed: ${response.statusText}`,
		);
	}

	return data;
}

// ==================== POST /api/auth/login ====================

/**
 * Request type for POST /api/auth/login
 */
export interface LoginRequest {
	/** User's email address */
	email: string;

	/** User's password */
	password: string;
}

/**
 * Response type for POST /api/auth/login
 */
export interface LoginResponse {
	/** Status of the login */
	status: "Success" | "Failed";

	/** JWT authentication token */
	auth_token: string;

	/** Unique user identifier */
	user_id: string;

	/** User's name */
	name: string;

	/** User's email */
	email: string;

	/** Optional error message (if status is "Failed") */
	message?: string;
}

/**
 * Login an existing user
 *
 * @param request - Login credentials containing email and password
 * @returns Promise resolving to the login response with auth token
 * @throws Error if login fails or credentials are invalid
 *
 * @example
 * ```typescript
 * const response = await loginUser({
 *   email: "user@example.com",
 *   password: "securePassword123"
 * });
 * console.log(`Welcome back ${response.name}!`);
 * localStorage.setItem('auth_token', response.auth_token);
 * ```
 */
export async function loginUser(request: LoginRequest): Promise<LoginResponse> {
	const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || `Login failed: ${response.statusText}`);
	}

	return data;
}

// ==================== GET /api/user/profile ====================

/**
 * Response type for GET /api/user/profile
 */
export interface UserProfileResponse {
	/** Status of the request */
	status: "Success" | "Failed";

	/** Unique user identifier */
	user_id: string;

	/** User's name */
	name: string;

	/** User's email */
	email: string;

	/** List of restaurant IDs the user has favorited */
	favorite_restaurant_ids: string[];

	/** Optional error message (if status is "Failed") */
	message?: string;
}

/**
 * Get the authenticated user's profile
 *
 * Requires an auth_token in the Authorization header.
 *
 * @param authToken - JWT authentication token
 * @returns Promise resolving to the user's profile data
 * @throws Error if user is not authenticated or request fails
 *
 * @example
 * ```typescript
 * const token = localStorage.getItem('auth_token');
 * if (token) {
 *   const profile = await getUserProfile(token);
 *   console.log(`User: ${profile.name}`);
 *   console.log(`Favorites: ${profile.favorite_restaurant_ids.length} restaurants`);
 * }
 * ```
 */
export async function getUserProfile(
	authToken: string,
): Promise<UserProfileResponse> {
	const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${authToken}`,
		},
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(
			data.message || `Failed to fetch profile: ${response.statusText}`,
		);
	}

	return data;
}

// ==================== Helper Functions ====================

/**
 * Check if a user is authenticated by validating their token
 *
 * @param authToken - JWT authentication token to validate
 * @returns Promise resolving to true if token is valid, false otherwise
 *
 * @example
 * ```typescript
 * const token = localStorage.getItem('auth_token');
 * const isValid = await validateAuthToken(token);
 * if (!isValid) {
 *   // Redirect to login page
 * }
 * ```
 */
export async function validateAuthToken(
	authToken: string | null,
): Promise<boolean> {
	if (!authToken) return false;

	try {
		await getUserProfile(authToken);
		return true;
	} catch {
		return false;
	}
}

/**
 * Complete authentication flow: register or login and store token
 *
 * @param request - Registration request data
 * @returns Promise resolving to the auth response with token stored in localStorage
 *
 * @example
 * ```typescript
 * const user = await registerAndStoreAuth({
 *   email: "user@example.com",
 *   password: "password123",
 *   name: "John Doe"
 * });
 * // Token is automatically stored in localStorage
 * console.log(`Logged in as ${user.name}`);
 * ```
 */
export async function registerAndStoreAuth(
	request: RegisterRequest,
): Promise<RegisterResponse> {
	const response = await registerUser(request);
	localStorage.setItem("creao_auth_token", response.auth_token);
	return response;
}

/**
 * Complete login flow: authenticate and store token
 *
 * @param request - Login request data
 * @returns Promise resolving to the auth response with token stored in localStorage
 *
 * @example
 * ```typescript
 * const user = await loginAndStoreAuth({
 *   email: "user@example.com",
 *   password: "password123"
 * });
 * // Token is automatically stored in localStorage
 * console.log(`Welcome back ${user.name}`);
 * ```
 */
export async function loginAndStoreAuth(
	request: LoginRequest,
): Promise<LoginResponse> {
	const response = await loginUser(request);
	localStorage.setItem("creao_auth_token", response.auth_token);
	return response;
}

/**
 * Logout the current user by clearing stored auth token
 *
 * @example
 * ```typescript
 * logout();
 * // Redirect to login page
 * ```
 */
export function logout(): void {
	localStorage.removeItem("creao_auth_token");
}

/**
 * Get the stored auth token from localStorage
 *
 * @returns The stored auth token or null if not found
 *
 * @example
 * ```typescript
 * const token = getStoredAuthToken();
 * if (token) {
 *   const profile = await getUserProfile(token);
 * }
 * ```
 */
export function getStoredAuthToken(): string | null {
	return localStorage.getItem("creao_auth_token");
}
