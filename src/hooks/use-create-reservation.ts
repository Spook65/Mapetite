/**
 * React Hook for Creating Restaurant Reservations
 *
 * This hook provides a convenient way to use the createReservation API
 * in React components with proper state management and error handling.
 */

import {
	type CreateReservationRequest,
	type CreateReservationResponse,
	createReservation,
} from "@/lib/api/reservation-create";
import { useMutation } from "@tanstack/react-query";

/**
 * Hook for creating restaurant reservations
 *
 * @example
 * ```tsx
 * function BookingForm() {
 *   const { mutate, isPending, isSuccess, data } = useCreateReservation();
 *
 *   const handleSubmit = (formData) => {
 *     mutate({
 *       restaurant_id: "noodles-0-annaba",
 *       date: formData.date,
 *       time: formData.time,
 *       party_size: formData.partySize
 *     });
 *   };
 *
 *   if (isSuccess) {
 *     return <div>Confirmed! ID: {data.confirmation_id}</div>;
 *   }
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useCreateReservation() {
	return useMutation<
		CreateReservationResponse,
		Error,
		CreateReservationRequest
	>({
		mutationFn: createReservation,
		retry: 1, // Retry once on failure
	});
}

/**
 * Hook with custom callbacks for success/error handling
 *
 * @example
 * ```tsx
 * function BookingForm() {
 *   const { mutate, isPending } = useCreateReservationWithCallbacks({
 *     onSuccess: (data) => {
 *       toast.success(`Booking confirmed! ID: ${data.confirmation_id}`);
 *       navigate('/confirmation');
 *     },
 *     onError: (error) => {
 *       toast.error(`Booking failed: ${error.message}`);
 *     }
 *   });
 *
 *   return <BookingFormUI onSubmit={mutate} loading={isPending} />;
 * }
 * ```
 */
export function useCreateReservationWithCallbacks(options?: {
	onSuccess?: (data: CreateReservationResponse) => void;
	onError?: (error: Error) => void;
}) {
	return useMutation<
		CreateReservationResponse,
		Error,
		CreateReservationRequest
	>({
		mutationFn: createReservation,
		retry: 1,
		onSuccess: options?.onSuccess,
		onError: options?.onError,
	});
}
