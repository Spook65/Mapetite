import { ChefProfileSection } from "@/components/ChefProfileSection";
import { DetailPhotoCarousel } from "@/components/DetailPhotoCarousel";
import { ReviewSummary } from "@/components/ReviewSummary";
import { SignatureMenu } from "@/components/SignatureMenu";

/**
 * Restaurant Detail Page Mock
 * Assembles the four detail page components into an elegant, stacked layout
 * with Dark Theme aesthetic (dark content background, light floating cards)
 */
export default function DetailPageMock() {
	// Mock restaurant data
	const restaurantData = {
		name: "Le Jardin Étoilé",
		chef: {
			name: "Chef Jean-Pierre Laurent",
			bio: "With over two decades of culinary excellence spanning Michelin-starred kitchens across Paris, Lyon, and New York, Chef Laurent brings unparalleled expertise and passion to every creation. Trained under legendary chefs and steeped in classical French technique, he masterfully blends traditional methods with contemporary innovation.",
			philosophy:
				"Cuisine is the poetry of the senses—a celebration of nature's bounty, cultural heritage, and human creativity. I believe in honoring each ingredient's inherent beauty while elevating it through precision, artistry, and unwavering dedication to excellence. Every dish tells a story of respect for tradition and passion for innovation.",
		},
		signatureDishes: [
			{
				name: "Pan-Seared Diver Scallops",
				description:
					"Succulent hand-harvested scallops with silky cauliflower purée, crispy prosciutto di Parma, and black truffle beurre blanc",
				price: 52,
				tags: ["Gluten-Free", "Signature"],
				featured: true,
			},
			{
				name: "A5 Wagyu Beef Tenderloin",
				description:
					"Premium Japanese wagyu with roasted bone marrow, heirloom rainbow carrots, and aged Bordeaux reduction",
				price: 138,
				tags: ["Chef's Specialty"],
				featured: true,
			},
			{
				name: "Maine Lobster Risotto",
				description:
					"Creamy Carnaroli rice with fresh Maine lobster, Spanish saffron, English peas, and 36-month Parmigiano-Reggiano",
				price: 68,
				tags: ["Signature"],
			},
			{
				name: "Foraged Wild Mushroom Tart",
				description:
					"Flaky puff pastry with hand-foraged mushrooms, herbed chèvre, fresh thyme, and aged balsamic reduction",
				price: 36,
				tags: ["Vegetarian", "Seasonal"],
			},
			{
				name: "Dover Sole Meunière Royale",
				description:
					"Whole Dover sole filleted tableside with brown butter, Meyer lemon, and fresh herb bouquet",
				price: 82,
				tags: ["Classic", "Chef's Favorite"],
			},
			{
				name: "Black Truffle Gnocchi",
				description:
					"Hand-rolled potato gnocchi with shaved Périgord black truffle, sage brown butter, and Grana Padano",
				price: 58,
				tags: ["Signature", "Vegetarian"],
			},
		],
		reviews: {
			overall: 4.8,
			total: 342,
			breakdown: {
				5: 268,
				4: 58,
				3: 12,
				2: 3,
				1: 1,
			},
			userReviews: [
				{
					id: "1",
					author: "Margaret S.",
					rating: 5,
					comment:
						"Absolutely transcendent dining experience! Chef Laurent's mastery is evident in every exquisite detail. The wagyu tenderloin was the finest I've tasted in years, and the truffle gnocchi was pure artistry. Service was impeccable—attentive yet unobtrusive. Worth every penny for a truly special occasion.",
					date: "2024-11-20",
					helpfulCount: 42,
				},
				{
					id: "2",
					author: "David K.",
					rating: 5,
					comment:
						"Outstanding from start to finish! The Dover sole prepared tableside was theatrical and delicious. Wine pairings were expertly curated by the sommelier. The ambiance strikes the perfect balance between elegant and welcoming. This is fine dining at its absolute zenith.",
					date: "2024-11-15",
					helpfulCount: 38,
				},
				{
					id: "3",
					author: "Sophia T.",
					rating: 5,
					comment:
						"Chef Laurent's culinary philosophy shines through brilliantly. Each course was a revelation—creative yet rooted in classical technique. The scallops were cooked to absolute perfection, and the presentation was museum-worthy. An unforgettable anniversary dinner!",
					date: "2024-11-08",
					helpfulCount: 31,
				},
				{
					id: "4",
					author: "Richard M.",
					rating: 4,
					comment:
						"Exceptional food and impeccable service. The lobster risotto was rich and perfectly balanced. Only minor note: the dessert menu could be slightly more adventurous. Still, an outstanding experience overall that I'd highly recommend for any special celebration.",
					date: "2024-11-02",
					helpfulCount: 24,
				},
			],
		},
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-[oklch(0.14_0.04_250)] via-[oklch(0.10_0.045_250)] to-[oklch(0.14_0.04_250)]">
			{/* Page Container */}
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				{/* Page Header */}
				<div className="mb-12 text-center space-y-4">
					<h1 className="text-5xl font-serif-display font-bold text-white drop-shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.4)] tracking-tight">
						{restaurantData.name}
					</h1>
					<div className="flex items-center justify-center gap-3">
						<div className="h-px bg-gradient-to-r from-transparent via-primary to-secondary w-32 shadow-[0_0_12px_oklch(0.55_0.18_240_/_0.4)]" />
						<p className="text-xl font-serif-elegant text-white/90 drop-shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.3)]">
							A Culinary Journey
						</p>
						<div className="h-px bg-gradient-to-l from-transparent via-secondary to-primary w-32 shadow-[0_0_12px_oklch(0.65_0.14_195_/_0.4)]" />
					</div>
				</div>

				{/* Component Stack - Elegant vertical layout */}
				<div className="space-y-10">
					{/* 1. Photo Carousel */}
					<DetailPhotoCarousel restaurantName={restaurantData.name} />

					{/* 2. Chef Profile Section */}
					<ChefProfileSection
						chefName={restaurantData.chef.name}
						chefBio={restaurantData.chef.bio}
						philosophy={restaurantData.chef.philosophy}
					/>

					{/* 3. Signature Menu */}
					<SignatureMenu
						dishes={restaurantData.signatureDishes}
						pricingNote="Seasonal menu prices may vary. Gratuity not included."
					/>

					{/* 4. Review Summary */}
					<ReviewSummary
						overallRating={restaurantData.reviews.overall}
						totalReviews={restaurantData.reviews.total}
						ratingBreakdown={restaurantData.reviews.breakdown}
						reviews={restaurantData.reviews.userReviews}
						maxReviews={4}
					/>
				</div>

				{/* Footer Accent */}
				<div className="mt-16 flex items-center justify-center gap-3">
					<div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-primary/80 w-48 shadow-[0_0_12px_oklch(0.55_0.18_240_/_0.4)]" />
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rotate-45 border border-primary/80 shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.5)]" />
						<div className="w-2 h-2 rotate-45 border border-secondary/80 shadow-[0_0_10px_oklch(0.65_0.14_195_/_0.5)]" />
					</div>
					<div className="h-px bg-gradient-to-l from-transparent via-primary/60 to-primary/80 w-48 shadow-[0_0_12px_oklch(0.55_0.18_240_/_0.4)]" />
				</div>
			</div>
		</div>
	);
}
