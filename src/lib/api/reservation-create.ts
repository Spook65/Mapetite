/**
 * Reservation/Booking API Types and Mock Implementation
 *
 * This file provides TypeScript types and a mock implementation for the
 * /api/reservations/create endpoint (POST) to handle restaurant bookings.
 */

// Request Types
export interface CreateReservationRequest {
	/** Restaurant ID to book */
	restaurant_id: string;

	/** Reservation date (format: YYYY-MM-DD) */
	date: string;

	/** Reservation time (format: HH:MM) */
	time: string;

	/** Number of people in the party */
	party_size: number;

	/** Optional customer name */
	customer_name?: string;

	/** Optional customer email */
	customer_email?: string;

	/** Optional customer phone */
	customer_phone?: string;

	/** Optional special requests */
	special_requests?: string;
}

// Response Type
export interface CreateReservationResponse {
	/** Status of the booking request */
	status: "Success" | "Failed";

	/** Unique confirmation ID for the reservation */
	confirmation_id: string;

	/** Timestamp when the reservation was created */
	reserved_at: string;

	/** Optional message with additional information */
	message?: string;

	/** Echo back the reservation details */
	reservation_details?: {
		restaurant_id: string;
		date: string;
		time: string;
		party_size: number;
	};
}

/**
 * Generate a unique confirmation ID
 */
function generateConfirmationId(): string {
	const timestamp = Date.now();
	const random = Math.floor(Math.random() * 1000000);
	const combined = timestamp + random;

	// Convert to base36 and take last 6 characters, prefix with MP-
	const id = combined.toString(36).toUpperCase().slice(-6);
	return `MP-${id}`;
}

/**
 * Mock implementation of POST /api/reservations/create endpoint
 *
 * This endpoint creates a new restaurant reservation and returns
 * a confirmation with a unique booking reference.
 *
 * @param request - Reservation request data
 * @returns Promise resolving to reservation confirmation
 */
export async function createReservation(
	request: CreateReservationRequest,
): Promise<CreateReservationResponse> {
	// Simulate API delay (network + processing)
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Basic validation
	if (!request.restaurant_id) {
		return {
			status: "Failed",
			confirmation_id: "",
			reserved_at: new Date().toISOString(),
			message: "Restaurant ID is required",
		};
	}

	if (!request.date) {
		return {
			status: "Failed",
			confirmation_id: "",
			reserved_at: new Date().toISOString(),
			message: "Reservation date is required",
		};
	}

	if (!request.time) {
		return {
			status: "Failed",
			confirmation_id: "",
			reserved_at: new Date().toISOString(),
			message: "Reservation time is required",
		};
	}

	if (!request.party_size || request.party_size < 1) {
		return {
			status: "Failed",
			confirmation_id: "",
			reserved_at: new Date().toISOString(),
			message: "Party size must be at least 1",
		};
	}

	// Generate successful response
	const confirmationId = generateConfirmationId();
	const reservedAt = new Date().toISOString();

	const response: CreateReservationResponse = {
		status: "Success",
		confirmation_id: confirmationId,
		reserved_at: reservedAt,
		message: "Your reservation has been successfully confirmed!",
		reservation_details: {
			restaurant_id: request.restaurant_id,
			date: request.date,
			time: request.time,
			party_size: request.party_size,
		},
	};

	return response;
}

/**
 * Example usage:
 *
 * ```typescript
 * // Create a new reservation
 * const reservationRequest: CreateReservationRequest = {
 *   restaurant_id: "noodles-0-annaba",
 *   date: "2025-11-25",
 *   time: "19:00",
 *   party_size: 4,
 *   customer_name: "John Doe",
 *   customer_email: "john@example.com",
 *   customer_phone: "+213 555-1234"
 * };
 *
 * const response = await createReservation(reservationRequest);
 *
 * if (response.status === "Success") {
 *   console.log(`Booking confirmed! ID: ${response.confirmation_id}`);
 *   console.log(`Reserved at: ${response.reserved_at}`);
 * }
 * ```
 */
