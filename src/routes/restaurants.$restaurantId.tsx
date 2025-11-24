import { Layout } from "@/components/Layout";
import { ReservationModal } from "@/components/ReservationModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import {
	type Review,
	type SignatureDish,
	getRestaurantDetail,
} from "@/lib/api/restaurant-detail";
import { cn } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	Award,
	ChefHat,
	Clock,
	DollarSign,
	Globe,
	Mail,
	MapPin,
	Phone,
	Star,
	Utensils,
	Wifi,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/restaurants/$restaurantId")({
	loader: async ({ params }) => {
		const data = await getRestaurantDetail(params.restaurantId);
		return data;
	},
	component: RestaurantDetailPage,
});

function RestaurantDetailPage() {
	const restaurant = Route.useLoaderData();
	const navigate = useNavigate();
	const [reservationModalOpen, setReservationModalOpen] = useState(false);

	// Calculate star rating breakdown from reviews
	const ratingBreakdown = {
		5: 0,
		4: 0,
		3: 0,
		2: 0,
		1: 0,
	};

	for (const review of restaurant.reviews) {
		const roundedRating = Math.floor(review.rating);
		if (roundedRating >= 1 && roundedRating <= 5) {
			ratingBreakdown[roundedRating as keyof typeof ratingBreakdown]++;
		}
	}

	const totalReviews = restaurant.reviews.length;

	// Helper function to render stars
	const renderStars = (rating: number, size = "size-4") => {
		const stars = [];
		for (let i = 0; i < 5; i++) {
			stars.push(
				<Star
					key={`star-${i}`}
					className={cn(
						size,
						i < Math.floor(rating)
							? "fill-primary text-primary"
							: i < rating
								? "fill-primary/50 text-primary"
								: "fill-muted text-muted",
					)}
				/>,
			);
		}
		return stars;
	};

	// Helper function to render price range
	const renderPriceRange = (pricing: number) => {
		const dollars = [];
		for (let i = 0; i < 4; i++) {
			dollars.push(
				<DollarSign
					key={`price-${i}`}
					className={cn(
						"size-4",
						i < pricing ? "text-secondary" : "text-muted",
					)}
				/>,
			);
		}
		return dollars;
	};

	return (
		<Layout>
			<div className="min-h-screen bg-[oklch(0.10_0.018_280)] text-foreground">
				{/* Hero Section with Back Button */}
				<div className="container mx-auto px-4 py-6">
					<Button
						variant="outline"
						onClick={() => navigate({ to: "/restaurants" })}
						className="mb-6 border-2 border-primary/40 bg-card/80 backdrop-blur-sm hover:bg-card hover:shadow-[0_0_15px_oklch(0.68_0.24_300_/_0.3)]"
					>
						<ArrowLeft className="mr-2 size-4" />
						Back to Restaurants
					</Button>

					{/* Photo Gallery Carousel */}
					<Card className="border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.68_0.24_300_/_0.2),0_6px_20px_black] mb-8">
						<CardContent className="p-0">
							<Carousel className="w-full">
								<CarouselContent>
									{restaurant.gallery_image_urls.map((url: string) => (
										<CarouselItem key={url}>
											<div className="relative aspect-[21/9] w-full overflow-hidden rounded-t-lg">
												<img
													src={url}
													alt={`${restaurant.name} - Gallery view`}
													className="h-full w-full object-cover"
												/>
											</div>
										</CarouselItem>
									))}
								</CarouselContent>
								<CarouselPrevious className="left-4 border-2 border-primary/60 bg-card/90 backdrop-blur-sm hover:bg-primary hover:text-white" />
								<CarouselNext className="right-4 border-2 border-primary/60 bg-card/90 backdrop-blur-sm hover:bg-primary hover:text-white" />
							</Carousel>
						</CardContent>
					</Card>

					{/* Restaurant Header Info */}
					<Card className="border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.68_0.24_300_/_0.2),0_6px_20px_black] mb-8">
						<CardHeader>
							<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
								<div className="flex-1">
									<CardTitle className="text-4xl font-serif-elegant mb-4 text-card-foreground drop-shadow-[0_0_10px_oklch(0.68_0.24_300_/_0.2)]">
										{restaurant.name}
									</CardTitle>
									<CardDescription className="text-lg mb-4">
										{restaurant.description}
									</CardDescription>

									{/* Rating, Reviews, Price */}
									<div className="flex flex-wrap items-center gap-4 mb-4">
										<div className="flex items-center gap-2">
											<div className="flex">
												{renderStars(restaurant.rating)}
											</div>
											<span className="text-lg font-semibold">
												{restaurant.rating.toFixed(1)}
											</span>
											<span className="text-sm text-muted-foreground">
												({restaurant.review_count} reviews)
											</span>
										</div>
										<div className="flex items-center">
											{renderPriceRange(restaurant.pricing)}
										</div>
										<Badge
											variant={restaurant.is_open ? "default" : "secondary"}
											className={cn(
												"text-sm",
												restaurant.is_open
													? "bg-green-600 text-white"
													: "bg-red-600 text-white",
											)}
										>
											{restaurant.is_open ? "Open Now" : "Closed"}
										</Badge>
									</div>

									{/* Categories */}
									<div className="flex flex-wrap gap-2 mb-4">
										{restaurant.categories.map((category: string) => (
											<Badge
												key={category}
												variant="outline"
												className="border-primary/40 text-primary"
											>
												<Utensils className="mr-1 size-3" />
												{category}
											</Badge>
										))}
									</div>

									{/* Quick Info */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
										<div className="flex items-center gap-2">
											<MapPin className="size-4 text-primary" />
											<span>
												{restaurant.address.street}, {restaurant.address.city}
											</span>
										</div>
										{restaurant.hours && (
											<div className="flex items-center gap-2">
												<Clock className="size-4 text-primary" />
												<span>
													{restaurant.hours.open} - {restaurant.hours.close}
												</span>
											</div>
										)}
										{restaurant.phone && (
											<div className="flex items-center gap-2">
												<Phone className="size-4 text-primary" />
												<span>{restaurant.phone}</span>
											</div>
										)}
										{restaurant.email && (
											<div className="flex items-center gap-2">
												<Mail className="size-4 text-primary" />
												<span>{restaurant.email}</span>
											</div>
										)}
									</div>
								</div>

								{/* CTA Section */}
								<div className="lg:w-80">
									<Card className="border-2 border-secondary/40 bg-[oklch(0.97_0.008_75)] shadow-lg">
										<CardContent className="p-6">
											<div className="text-center mb-4">
												<p className="text-sm text-muted-foreground mb-1">
													Starting from
												</p>
												<p className="text-3xl font-bold text-card-foreground">
													{restaurant.signature_dishes[0]?.estimated_price ||
														"$$"}
												</p>
												<p className="text-xs text-muted-foreground">
													per person
												</p>
											</div>
											<Button
												onClick={() => setReservationModalOpen(true)}
												className="w-full cursor-pointer group bg-gradient-to-r from-primary via-secondary to-primary text-white hover:text-[oklch(0.68_0.24_300)] hover:shadow-[0_0_30px_oklch(0.68_0.24_300_/_0.5)] font-serif-elegant font-semibold tracking-wide shadow-[0_0_20px_oklch(0.68_0.24_300_/_0.4)] py-6 text-lg transition-all duration-300 border-2 border-primary/60"
											>
												Make Reservation
											</Button>
											{restaurant.amenities &&
												restaurant.amenities.length > 0 && (
													<div className="mt-4 pt-4 border-t border-border">
														<p className="text-xs font-semibold mb-2">
															Amenities
														</p>
														<div className="flex flex-wrap gap-1">
															{restaurant.amenities
																.slice(0, 4)
																.map((amenity: string) => (
																	<Badge
																		key={amenity}
																		variant="secondary"
																		className="text-xs"
																	>
																		{amenity}
																	</Badge>
																))}
														</div>
													</div>
												)}
										</CardContent>
									</Card>
								</div>
							</div>
						</CardHeader>
					</Card>

					{/* Chef Profile & Philosophy */}
					<Card className="border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.68_0.24_300_/_0.2),0_6px_20px_black] mb-8">
						<CardHeader>
							<CardTitle className="text-3xl font-serif-elegant flex items-center gap-3 text-card-foreground drop-shadow-[0_0_10px_oklch(0.68_0.24_300_/_0.2)]">
								<ChefHat className="size-8 text-primary stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.4)]" />
								Meet Our Chef
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col md:flex-row gap-8">
								{/* Chef Photo */}
								{restaurant.chef_bio.photo_url && (
									<div className="flex-shrink-0">
										<div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/40 shadow-[0_0_20px_oklch(0.68_0.24_300_/_0.3)]">
											<img
												src={restaurant.chef_bio.photo_url}
												alt={restaurant.chef_bio.name}
												className="w-full h-full object-cover"
											/>
										</div>
									</div>
								)}

								{/* Chef Info */}
								<div className="flex-1">
									<h3 className="text-2xl font-bold mb-2">
										{restaurant.chef_bio.name}
									</h3>
									{restaurant.chef_bio.years_of_experience && (
										<p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
											<Award className="size-4 text-secondary" />
											{restaurant.chef_bio.years_of_experience} years of
											culinary experience
										</p>
									)}
									<p className="text-base leading-relaxed mb-4">
										{restaurant.chef_bio.bio}
									</p>
									{restaurant.chef_bio.specialties &&
										restaurant.chef_bio.specialties.length > 0 && (
											<div>
												<p className="text-sm font-semibold mb-2">
													Specialties:
												</p>
												<div className="flex flex-wrap gap-2">
													{restaurant.chef_bio.specialties.map(
														(specialty: string) => (
															<Badge
																key={specialty}
																variant="outline"
																className="border-secondary/40 text-secondary"
															>
																{specialty}
															</Badge>
														),
													)}
												</div>
											</div>
										)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Signature Dishes - Detailed Menu */}
					<Card className="border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.68_0.24_300_/_0.2),0_6px_20px_black] mb-8">
						<CardHeader>
							<CardTitle className="text-3xl font-serif-elegant flex items-center gap-3 text-card-foreground drop-shadow-[0_0_10px_oklch(0.68_0.24_300_/_0.2)]">
								<Utensils className="size-8 text-primary stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.4)]" />
								Signature Dishes
							</CardTitle>
							<CardDescription>
								Our chef's carefully curated selection of specialty dishes
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{restaurant.signature_dishes.map((dish: SignatureDish) => (
									<Card
										key={dish.name}
										className="border-2 border-primary/20 bg-[oklch(0.97_0.008_75)] hover:border-primary/60 hover:shadow-[0_0_15px_oklch(0.68_0.24_300_/_0.2)] transition-all duration-300"
									>
										{dish.photo_url && (
											<div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
												<img
													src={dish.photo_url}
													alt={dish.name}
													className="h-full w-full object-cover"
												/>
											</div>
										)}
										<CardContent className="p-4">
											<div className="flex justify-between items-start mb-2">
												<h4 className="font-semibold text-lg">{dish.name}</h4>
												<span className="text-lg font-bold text-secondary whitespace-nowrap ml-2">
													{dish.estimated_price}
												</span>
											</div>
											{dish.description && (
												<p className="text-sm text-muted-foreground">
													{dish.description}
												</p>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>

					{/* User Reviews Section */}
					<Card className="border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.68_0.24_300_/_0.2),0_6px_20px_black] mb-8">
						<CardHeader>
							<CardTitle className="text-3xl font-serif-elegant flex items-center gap-3 text-card-foreground drop-shadow-[0_0_10px_oklch(0.68_0.24_300_/_0.2)]">
								<Star className="size-8 text-primary stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.4)] fill-primary" />
								Customer Reviews
							</CardTitle>
							<CardDescription>
								What our guests are saying about their experience
							</CardDescription>
						</CardHeader>
						<CardContent>
							{/* Rating Breakdown */}
							<div className="mb-8 p-6 bg-[oklch(0.97_0.008_75)] rounded-lg border-2 border-primary/20">
								<div className="flex flex-col md:flex-row gap-8">
									{/* Overall Rating */}
									<div className="flex flex-col items-center justify-center md:border-r border-border md:pr-8">
										<div className="text-6xl font-bold text-primary mb-2">
											{restaurant.rating.toFixed(1)}
										</div>
										<div className="flex mb-2">
											{renderStars(restaurant.rating, "size-5")}
										</div>
										<p className="text-sm text-muted-foreground">
											Based on {restaurant.review_count} reviews
										</p>
									</div>

									{/* Star Breakdown */}
									<div className="flex-1">
										<p className="font-semibold mb-4">Rating Distribution</p>
										{[5, 4, 3, 2, 1].map((stars) => {
											const count =
												ratingBreakdown[stars as keyof typeof ratingBreakdown];
											const percentage =
												totalReviews > 0 ? (count / totalReviews) * 100 : 0;

											return (
												<div
													key={`breakdown-${stars}`}
													className="flex items-center gap-3 mb-2"
												>
													<span className="text-sm w-12 flex items-center gap-1">
														{stars}{" "}
														<Star className="size-3 fill-primary text-primary" />
													</span>
													<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
														<div
															className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
															style={{ width: `${percentage}%` }}
														/>
													</div>
													<span className="text-sm text-muted-foreground w-12 text-right">
														{count}
													</span>
												</div>
											);
										})}
									</div>
								</div>
							</div>

							{/* Individual Reviews */}
							<div className="space-y-6">
								{restaurant.reviews.map((review: Review) => (
									<div
										key={review.id}
										className="p-6 bg-[oklch(0.97_0.008_75)] rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-all duration-300"
									>
										<div className="flex items-start gap-4">
											{/* Author Photo */}
											{review.author_photo && (
												<div className="flex-shrink-0">
													<div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30">
														<img
															src={review.author_photo}
															alt={review.author}
															className="w-full h-full object-cover"
														/>
													</div>
												</div>
											)}

											{/* Review Content */}
											<div className="flex-1">
												<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
													<div>
														<h4 className="font-semibold text-base">
															{review.author}
														</h4>
														<p className="text-xs text-muted-foreground">
															{review.date}
														</p>
													</div>
													<div className="flex">
														{renderStars(review.rating)}
													</div>
												</div>
												<p className="text-sm leading-relaxed">
													{review.comment}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Additional Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
						{/* Contact Information */}
						{(restaurant.phone ||
							restaurant.email ||
							restaurant.website ||
							restaurant.social_media) && (
							<Card className="border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.68_0.24_300_/_0.2),0_6px_20px_black]">
								<CardHeader>
									<CardTitle className="text-2xl font-serif-elegant text-card-foreground drop-shadow-[0_0_10px_oklch(0.68_0.24_300_/_0.2)]">
										Contact Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{restaurant.phone && (
										<div className="flex items-center gap-3">
											<Phone className="size-5 text-primary" />
											<a
												href={`tel:${restaurant.phone}`}
												className="hover:text-primary transition-colors"
											>
												{restaurant.phone}
											</a>
										</div>
									)}
									{restaurant.email && (
										<div className="flex items-center gap-3">
											<Mail className="size-5 text-primary" />
											<a
												href={`mailto:${restaurant.email}`}
												className="hover:text-primary transition-colors"
											>
												{restaurant.email}
											</a>
										</div>
									)}
									{restaurant.website && (
										<div className="flex items-center gap-3">
											<Globe className="size-5 text-primary" />
											<a
												href={restaurant.website}
												target="_blank"
												rel="noopener noreferrer"
												className="hover:text-primary transition-colors"
											>
												Visit Website
											</a>
										</div>
									)}
									{restaurant.address && (
										<div className="flex items-start gap-3">
											<MapPin className="size-5 text-primary mt-0.5" />
											<div>
												<p>{restaurant.address.street}</p>
												<p>
													{restaurant.address.city}, {restaurant.address.state}{" "}
													{restaurant.address.zipCode}
												</p>
												<p>{restaurant.address.country}</p>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)}

						{/* Amenities & Payment */}
						<Card className="border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.68_0.24_300_/_0.2),0_6px_20px_black]">
							<CardHeader>
								<CardTitle className="text-2xl font-serif-elegant text-card-foreground drop-shadow-[0_0_10px_oklch(0.68_0.24_300_/_0.2)]">
									Amenities & Payment
								</CardTitle>
							</CardHeader>
							<CardContent>
								{restaurant.amenities && restaurant.amenities.length > 0 && (
									<div className="mb-6">
										<p className="text-sm font-semibold mb-3">
											Available Amenities
										</p>
										<div className="flex flex-wrap gap-2">
											{restaurant.amenities.map((amenity: string) => (
												<Badge
													key={amenity}
													variant="outline"
													className="border-primary/40"
												>
													<Wifi className="mr-1 size-3" />
													{amenity}
												</Badge>
											))}
										</div>
									</div>
								)}
								{restaurant.payment_methods &&
									restaurant.payment_methods.length > 0 && (
										<div>
											<p className="text-sm font-semibold mb-3">
												Accepted Payment Methods
											</p>
											<div className="flex flex-wrap gap-2">
												{restaurant.payment_methods.map((method: string) => (
													<Badge
														key={method}
														variant="secondary"
														className="bg-secondary/20"
													>
														{method}
													</Badge>
												))}
											</div>
										</div>
									)}
							</CardContent>
						</Card>
					</div>

					{/* Bottom CTA */}
					<Card className="border-2 border-secondary/60 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 shadow-[0_0_30px_oklch(0.68_0.24_300_/_0.3)]">
						<CardContent className="p-8 text-center">
							<h3 className="text-2xl font-serif-elegant mb-3 text-card-foreground drop-shadow-[0_0_10px_oklch(0.68_0.24_300_/_0.2)]">
								Ready to Experience {restaurant.name}?
							</h3>
							<p className="text-muted-foreground mb-6">
								Reserve your table now and enjoy an unforgettable dining
								experience
							</p>
							<Button
								onClick={() => setReservationModalOpen(true)}
								size="lg"
								className="cursor-pointer group bg-gradient-to-r from-primary via-secondary to-primary text-white hover:text-[oklch(0.68_0.24_300)] hover:shadow-[0_0_30px_oklch(0.68_0.24_300_/_0.5)] font-serif-elegant font-semibold tracking-wide shadow-[0_0_20px_oklch(0.68_0.24_300_/_0.4)] px-12 py-6 text-lg transition-all duration-300 border-2 border-primary/60"
							>
								Make Reservation Now
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Reservation Modal */}
				<ReservationModal
					open={reservationModalOpen}
					onOpenChange={setReservationModalOpen}
					restaurant={{
						id: restaurant.id,
						name: restaurant.name,
						address: {
							city: restaurant.address.city,
							state: restaurant.address.state,
						},
					}}
				/>
			</div>
		</Layout>
	);
}
