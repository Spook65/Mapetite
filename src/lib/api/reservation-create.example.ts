/**
 * Example usage of the Reservation/Booking API
 *
 * This file demonstrates how to use the createReservation endpoint
 * with various scenarios including successful bookings and validation failures.
 */

import {
	type CreateReservationRequest,
	createReservation,
} from "./reservation-create";

/**
 * Example 1: Successful reservation with all optional fields
 */
export async function exampleSuccessfulReservationFull() {
	console.log("Example 1: Successful reservation with full details");

	const request: CreateReservationRequest = {
		restaurant_id: "noodles-0-annaba",
		date: "2025-11-25",
		time: "19:00",
		party_size: 4,
		customer_name: "John Doe",
		customer_email: "john.doe@example.com",
		customer_phone: "+213 555-1234",
		special_requests: "Window seat preferred, celebrating anniversary",
	};

	const response = await createReservation(request);

	console.log("Response:", JSON.stringify(response, null, 2));
	/*
	 * Expected output:
	 * {
	 *   "status": "Success",
	 *   "confirmation_id": "MP-XXXXXX",
	 *   "reserved_at": "2025-11-23T...",
	 *   "message": "Your reservation has been successfully confirmed!",
	 *   "reservation_details": {
	 *     "restaurant_id": "noodles-0-annaba",
	 *     "date": "2025-11-25",
	 *     "time": "19:00",
	 *     "party_size": 4
	 *   }
	 * }
	 */
}

/**
 * Example 2: Successful reservation with only required fields
 */
export async function exampleSuccessfulReservationMinimal() {
	console.log("Example 2: Successful reservation with minimal details");

	const request: CreateReservationRequest = {
		restaurant_id: "italian-2-oran",
		date: "2025-12-01",
		time: "20:30",
		party_size: 2,
	};

	const response = await createReservation(request);

	console.log("Response:", JSON.stringify(response, null, 2));
	console.log(`Confirmation ID: ${response.confirmation_id}`);
	console.log(`Status: ${response.status}`);
}

/**
 * Example 3: Large party reservation
 */
export async function exampleLargePartyReservation() {
	console.log("Example 3: Large party reservation");

	const request: CreateReservationRequest = {
		restaurant_id: "mexican-1-constantine",
		date: "2025-11-30",
		time: "18:00",
		party_size: 12,
		customer_name: "Sarah Johnson",
		customer_email: "sarah.j@company.com",
		special_requests: "Corporate dinner, need private dining area if available",
	};

	const response = await createReservation(request);

	if (response.status === "Success") {
		console.log("✅ Reservation confirmed!");
		console.log(`   Confirmation ID: ${response.confirmation_id}`);
		console.log(`   Party Size: ${response.reservation_details?.party_size}`);
	}
}

/**
 * Example 4: Weekend brunch reservation
 */
export async function exampleWeekendBrunchReservation() {
	console.log("Example 4: Weekend brunch reservation");

	const request: CreateReservationRequest = {
		restaurant_id: "healthy-0-algiers",
		date: "2025-11-29",
		time: "11:00",
		party_size: 3,
		customer_name: "Mike Chen",
		customer_phone: "+213 777-9999",
	};

	const response = await createReservation(request);
	console.log("Brunch Booking:", response);
}

/**
 * Example 5: Multiple consecutive reservations (for testing)
 */
export async function exampleMultipleReservations() {
	console.log("Example 5: Multiple reservations");

	const restaurants = [
		"noodles-0-annaba",
		"vegetarian-1-oran",
		"fastfood-2-constantine",
	];

	for (const restaurantId of restaurants) {
		const request: CreateReservationRequest = {
			restaurant_id: restaurantId,
			date: "2025-12-05",
			time: "19:00",
			party_size: 2,
		};

		const response = await createReservation(request);
		console.log(
			`${restaurantId}: ${response.status} - ${response.confirmation_id}`,
		);
	}
}

/**
 * Demo function to run all examples
 */
export async function runAllExamples() {
	console.log("=== Reservation API Examples ===\n");

	await exampleSuccessfulReservationFull();
	console.log("\n---\n");

	await exampleSuccessfulReservationMinimal();
	console.log("\n---\n");

	await exampleLargePartyReservation();
	console.log("\n---\n");

	await exampleWeekendBrunchReservation();
	console.log("\n---\n");

	await exampleMultipleReservations();

	console.log("\n=== All Examples Completed ===");
}

// Uncomment to run examples:
// runAllExamples();
