# Reservation/Booking API Documentation

## Endpoint: POST `/api/reservations/create`

This API endpoint handles restaurant reservation requests and returns booking confirmations.

---

## Request

### Method
`POST`

### Required Parameters

All parameters are sent in the request body as JSON:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `restaurant_id` | `string` | ✅ Yes | Unique identifier for the restaurant |
| `date` | `string` | ✅ Yes | Reservation date (format: YYYY-MM-DD) |
| `time` | `string` | ✅ Yes | Reservation time (format: HH:MM, 24-hour) |
| `party_size` | `number` | ✅ Yes | Number of guests (minimum: 1) |

### Optional Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customer_name` | `string` | ❌ No | Name of the person making the reservation |
| `customer_email` | `string` | ❌ No | Email address for confirmation |
| `customer_phone` | `string` | ❌ No | Phone number for contact |
| `special_requests` | `string` | ❌ No | Any special requests or notes |

### Example Request

```typescript
POST /api/reservations/create
Content-Type: application/json

{
  "restaurant_id": "noodles-0-annaba",
  "date": "2025-11-25",
  "time": "19:00",
  "party_size": 4,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+213 555-1234",
  "special_requests": "Window seat preferred"
}
```

---

## Response

### Success Response

**Status Code:** `200 OK`

```typescript
{
  "status": "Success",
  "confirmation_id": "MP-987654",
  "reserved_at": "2025-11-23T14:30:00.000Z",
  "message": "Your reservation has been successfully confirmed!",
  "reservation_details": {
    "restaurant_id": "noodles-0-annaba",
    "date": "2025-11-25",
    "time": "19:00",
    "party_size": 4
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"Success" \| "Failed"` | Status of the booking request |
| `confirmation_id` | `string` | Unique confirmation code (format: MP-XXXXXX) |
| `reserved_at` | `string` | ISO 8601 timestamp of when reservation was created |
| `message` | `string` | Human-readable message about the reservation |
| `reservation_details` | `object` | Echo of the reservation parameters |

### Error Response

```typescript
{
  "status": "Failed",
  "confirmation_id": "",
  "reserved_at": "2025-11-23T14:30:00.000Z",
  "message": "Restaurant ID is required"
}
```

---

## Usage Examples

### 1. Using the API Function Directly

```typescript
import { createReservation } from '@/lib/api/reservation-create';

// Make a reservation
const response = await createReservation({
  restaurant_id: "noodles-0-annaba",
  date: "2025-11-25",
  time: "19:00",
  party_size: 4
});

if (response.status === "Success") {
  console.log(`Booking confirmed! ID: ${response.confirmation_id}`);
}
```

### 2. Using the React Hook

```tsx
import { useCreateReservation } from '@/hooks/use-create-reservation';

function BookingForm() {
  const { mutate, isPending, isSuccess, data } = useCreateReservation();

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({
      restaurant_id: "noodles-0-annaba",
      date: "2025-11-25",
      time: "19:00",
      party_size: 4
    });
  };

  if (isSuccess && data) {
    return (
      <div>
        <h2>Booking Confirmed!</h2>
        <p>Confirmation ID: {data.confirmation_id}</p>
        <p>Reserved at: {new Date(data.reserved_at).toLocaleString()}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Booking...' : 'Make Reservation'}
      </button>
    </form>
  );
}
```

### 3. With Success/Error Callbacks

```tsx
import { useCreateReservationWithCallbacks } from '@/hooks/use-create-reservation';

function BookingForm() {
  const { mutate, isPending } = useCreateReservationWithCallbacks({
    onSuccess: (data) => {
      alert(`Booking confirmed! ID: ${data.confirmation_id}`);
      // Navigate to confirmation page
    },
    onError: (error) => {
      alert(`Booking failed: ${error.message}`);
    }
  });

  return (
    <button
      onClick={() => mutate({
        restaurant_id: "italian-2-oran",
        date: "2025-12-01",
        time: "20:00",
        party_size: 2
      })}
      disabled={isPending}
    >
      Book Table
    </button>
  );
}
```

---

## Validation Rules

The API performs the following validations:

1. **Restaurant ID**: Must be provided and non-empty
2. **Date**: Must be provided and non-empty
3. **Time**: Must be provided and non-empty
4. **Party Size**: Must be at least 1

If any validation fails, the API returns a `Failed` status with an appropriate error message.

---

## Confirmation ID Format

Confirmation IDs follow the pattern: `MP-XXXXXX`

- Prefix: `MP-` (stands for "My Platform")
- Suffix: 6-character alphanumeric code (base36 encoded)
- Example: `MP-987654`, `MP-AB12XY`, `MP-ZZ99AA`

Each confirmation ID is unique and can be used to track or manage the reservation.

---

## Files

- **API Implementation**: `src/lib/api/reservation-create.ts`
- **React Hooks**: `src/hooks/use-create-reservation.ts`
- **Examples**: `src/lib/api/reservation-create.example.ts`
- **Documentation**: `src/lib/api/RESERVATION_API.md` (this file)

---

## TypeScript Types

```typescript
interface CreateReservationRequest {
  restaurant_id: string;
  date: string;
  time: string;
  party_size: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  special_requests?: string;
}

interface CreateReservationResponse {
  status: "Success" | "Failed";
  confirmation_id: string;
  reserved_at: string;
  message?: string;
  reservation_details?: {
    restaurant_id: string;
    date: string;
    time: string;
    party_size: number;
  };
}
```

---

## Mock Implementation Notes

This is a **mock implementation** that simulates a booking API:

- All requests are processed successfully (unless validation fails)
- No actual database persistence occurs
- Response delays are simulated (500ms)
- Confirmation IDs are generated using timestamp + random number

For production use, this would need to be connected to:
- Real backend API endpoint
- Database for storing reservations
- Email/SMS notification system
- Payment processing (if required)
- Availability checking system
