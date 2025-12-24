import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MapPreviewProps {
	latitude: number;
	longitude: number;
	zoom?: number;
	className?: string;
	height?: number;
}

/**
 * Lightweight OpenStreetMap embed without extra dependencies.
 * Uses the standard OSM embed endpoint (no API key).
 */
export function MapPreview({
	latitude,
	longitude,
	zoom = 15,
	className,
	height = 260,
}: MapPreviewProps) {
	const delta = 0.01;
	const bbox = [
		longitude - delta,
		latitude - delta,
		longitude + delta,
		latitude + delta,
	]
		.map((n) => n.toFixed(6))
		.join(",");

	const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;

	return (
		<Card
			className={cn(
				"overflow-hidden border-2 border-primary/30 shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.15)]",
				className,
			)}
		>
			<iframe
				title="Map preview"
				src={src}
				className="w-full"
				style={{ height }}
				loading="lazy"
				referrerPolicy="no-referrer"
			/>
		</Card>
	);
}

