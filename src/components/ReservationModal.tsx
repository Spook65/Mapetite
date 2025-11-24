import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateReservation } from "@/hooks/use-create-reservation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface Restaurant {
	id: string;
	name: string;
	address: {
		city: string;
		state: string;
	};
}

interface ReservationModalProps {
	restaurant: Restaurant | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ReservationModal({
	restaurant,
	open,
	onOpenChange,
}: ReservationModalProps) {
	const [date, setDate] = useState<Date>();
	const [time, setTime] = useState<string>("");
	const [partySize, setPartySize] = useState<string>("");

	const { mutate, isPending, isSuccess, data, reset } = useCreateReservation();

	// Reset form when modal closes
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			// Reset form state
			setDate(undefined);
			setTime("");
			setPartySize("");
			reset();
		}
		onOpenChange(newOpen);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!date || !time || !partySize || !restaurant) {
			return;
		}

		mutate({
			restaurant_id: restaurant.id,
			date: format(date, "yyyy-MM-dd"),
			time: time,
			party_size: Number.parseInt(partySize),
		});
	};

	// Generate time slots from 8 AM to 10 PM (every 30 minutes)
	const timeSlots = [];
	for (let hour = 8; hour <= 22; hour++) {
		for (const minute of ["00", "30"]) {
			if (hour === 22 && minute === "30") break; // Stop at 10:00 PM
			const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
			const period = hour >= 12 ? "PM" : "AM";
			const timeValue = `${hour.toString().padStart(2, "0")}:${minute}`;
			const timeDisplay = `${displayHour}:${minute} ${period}`;
			timeSlots.push({ value: timeValue, display: timeDisplay });
		}
	}

	// Party size options (1-20 guests)
	const partySizes = Array.from({ length: 20 }, (_, i) => {
		const size = i + 1;
		return {
			value: size.toString(),
			display: size === 1 ? "1 Guest" : `${size} Guests`,
		};
	});

	if (!restaurant) return null;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[500px] bg-[oklch(0.97_0.008_75)]">
				<DialogHeader>
					<DialogTitle className="text-2xl font-serif-display text-[oklch(0.2_0.03_145)]">
						{isSuccess ? "Reservation Confirmed!" : "Reserve Your Table"}
					</DialogTitle>
					<DialogDescription className="font-serif-elegant text-[oklch(0.35_0.03_145)]">
						{isSuccess
							? "Your reservation has been successfully confirmed"
							: `Book your dining experience at ${restaurant.name}`}
					</DialogDescription>
				</DialogHeader>

				{isSuccess && data ? (
					<div className="py-8 space-y-6">
						{/* Success Icon */}
						<div className="flex justify-center">
							<div className="rounded-full bg-gradient-to-br from-primary via-secondary to-primary p-4 shadow-[0_0_20px_oklch(0.68_0.24_300_/_0.4)]">
								<CheckCircle2 className="h-12 w-12 text-white stroke-[2.5]" />
							</div>
						</div>

						{/* Confirmation Details */}
						<div className="space-y-4 text-center">
							<div className="bg-[oklch(0.96_0.01_75)] border-2 border-primary/40 rounded-md p-6 shadow-[0_0_15px_oklch(0.68_0.24_300_/_0.15)]">
								<p className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] mb-2">
									Confirmation ID
								</p>
								<p className="text-3xl font-serif-display text-primary drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.3)]">
									{data.confirmation_id}
								</p>
							</div>

							<div className="space-y-2 text-sm font-serif-elegant text-[oklch(0.35_0.03_145)]">
								<p>
									<span className="font-semibold">Restaurant:</span>{" "}
									{restaurant.name}
								</p>
								<p>
									<span className="font-semibold">Date:</span>{" "}
									{date ? format(date, "EEEE, MMMM d, yyyy") : ""}
								</p>
								<p>
									<span className="font-semibold">Time:</span>{" "}
									{timeSlots.find((t) => t.value === time)?.display}
								</p>
								<p>
									<span className="font-semibold">Party Size:</span>{" "}
									{partySizes.find((p) => p.value === partySize)?.display}
								</p>
							</div>

							<p className="text-xs text-[oklch(0.45_0.03_145)] font-serif-elegant pt-4">
								A confirmation has been sent. Please save your confirmation ID
								for your records.
							</p>
						</div>

						<Button
							onClick={() => handleOpenChange(false)}
							className="w-full bg-gradient-to-r from-primary via-secondary to-primary text-white shadow-[0_0_20px_oklch(0.68_0.24_300_/_0.4)] border-2 border-primary/60"
						>
							Done
						</Button>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-6 py-4">
						{/* Date Picker */}
						<div className="space-y-2">
							<Label className="text-base font-semibold text-[oklch(0.2_0.03_145)]">
								Select Date
							</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal border-2 border-primary/40 hover:border-primary/60",
											!date && "text-muted-foreground",
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{date ? format(date, "EEEE, MMMM d, yyyy") : "Pick a date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={date}
										onSelect={setDate}
										disabled={(date) =>
											date < new Date(new Date().setHours(0, 0, 0, 0))
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						{/* Time Selector */}
						<div className="space-y-2">
							<Label className="text-base font-semibold text-[oklch(0.2_0.03_145)]">
								Select Time
							</Label>
							<Select value={time} onValueChange={setTime}>
								<SelectTrigger className="w-full border-2 border-primary/40 hover:border-primary/60">
									<SelectValue placeholder="Choose a time" />
								</SelectTrigger>
								<SelectContent>
									{timeSlots.map((slot) => (
										<SelectItem key={slot.value} value={slot.value}>
											{slot.display}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Party Size Selector */}
						<div className="space-y-2">
							<Label className="text-base font-semibold text-[oklch(0.2_0.03_145)]">
								Party Size
							</Label>
							<Select value={partySize} onValueChange={setPartySize}>
								<SelectTrigger className="w-full border-2 border-primary/40 hover:border-primary/60">
									<SelectValue placeholder="Number of guests" />
								</SelectTrigger>
								<SelectContent>
									{partySizes.map((size) => (
										<SelectItem key={size.value} value={size.value}>
											{size.display}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Submit Button */}
						<Button
							type="submit"
							disabled={!date || !time || !partySize || isPending}
							className="w-full bg-gradient-to-r from-primary via-secondary to-primary text-white hover:text-[oklch(0.68_0.24_300)] hover:shadow-[0_0_30px_oklch(0.68_0.24_300_/_0.5)] font-serif-elegant font-semibold tracking-wide shadow-[0_0_20px_oklch(0.68_0.24_300_/_0.4)] py-6 text-base transition-all duration-300 border-2 border-primary/60"
						>
							{isPending ? "Booking..." : "Confirm Reservation"}
						</Button>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
