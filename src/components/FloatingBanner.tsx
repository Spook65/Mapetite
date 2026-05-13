import CreaoLogo from "@/assets/creao_logo.svg?react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

interface FloatingBannerProps {
	position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
}

export function FloatingBanner({
	position = "bottom-left",
}: FloatingBannerProps) {
	const [isVisible, setIsVisible] = useState(true);
	const { status } = useAuth();

	const handleClose = () => {
		setIsVisible(false);
	};

	if (!isVisible) {
		return null;
	}

	// Position classes mapping
	const positionClasses = {
		"bottom-left": "bottom-4 left-4",
		"bottom-right": "bottom-4 right-4",
		"top-left": "top-4 left-4",
		"top-right": "top-4 right-4",
	};

	// Auth status indicator styles
	const getAuthIndicatorClass = () => {
		switch (status) {
			case "authenticated":
				return "bg-green-500 shadow-green-500/50";
			case "invalid_token":
				return "bg-red-500 shadow-red-500/50";
			case "loading":
				return "bg-yellow-500 shadow-yellow-500/50";
			default:
				return "bg-red-500 shadow-red-500/50";
		}
	};

	return (
		<div
			className={`fixed ${positionClasses[position]} z-50 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-none`}
			role="banner"
			aria-label="Creao branding banner"
		>
			<div
				className={`h-2.5 w-2.5 rounded-full ${getAuthIndicatorClass()}`}
				aria-label={`Authentication status: ${status}`}
			/>

			<span className="flex items-center">
				<CreaoLogo
					className="h-3 w-auto align-middle fill-current text-foreground"
					aria-label="Creao Logo"
				/>
			</span>
			<button
				type="button"
				className="ml-1 rounded-md text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
				onClick={handleClose}
				aria-label="Close banner"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	);
}
