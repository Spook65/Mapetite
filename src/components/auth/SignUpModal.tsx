import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/use-auth-api";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface SignUpModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SignUpModal({ open, onOpenChange }: SignUpModalProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [showSuccess, setShowSuccess] = useState(false);

	const {
		mutate: register,
		isPending,
		error,
	} = useRegister({
		onSuccess: (data) => {
			// Store the auth token
			localStorage.setItem("creao_auth_token", data.auth_token);

			// Show success message
			setShowSuccess(true);

			// Clear form
			setEmail("");
			setPassword("");
			setName("");

			// Close modal after 2 seconds
			setTimeout(() => {
				setShowSuccess(false);
				onOpenChange(false);
			}, 2000);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		register({ email, password, name });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md bg-card border-2 border-primary/40 shadow-[0_0_40px_oklch(0.55_0.18_240_/_0.3)]">
				<DialogHeader>
					<DialogTitle className="text-2xl font-serif-display text-card-foreground">
						Create Account
					</DialogTitle>
					<DialogDescription className="font-serif-elegant text-card-foreground/70">
						Join Mapetite to discover and save your favorite restaurants
					</DialogDescription>
				</DialogHeader>

				{showSuccess ? (
					<div className="py-8 text-center">
						<div className="mb-4 flex justify-center">
							<div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_25px_oklch(0.55_0.18_240_/_0.6)]">
								<svg
									className="h-8 w-8 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									role="img"
									aria-label="Success checkmark"
								>
									<title>Success</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={3}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
						</div>
						<h3 className="text-xl font-serif-display text-card-foreground mb-2">
							Account Created!
						</h3>
						<p className="text-sm font-serif-elegant text-card-foreground/70">
							Welcome to Mapetite
						</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="name"
								className="font-serif-elegant text-card-foreground"
							>
								Name
							</Label>
							<Input
								id="name"
								type="text"
								placeholder="Enter your name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="bg-[oklch(0.96_0.008_250)] border-primary/30 focus:border-primary text-card-foreground placeholder:text-card-foreground/50"
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="email"
								className="font-serif-elegant text-card-foreground"
							>
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="bg-[oklch(0.96_0.008_250)] border-primary/30 focus:border-primary text-card-foreground placeholder:text-card-foreground/50"
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="font-serif-elegant text-card-foreground"
							>
								Password
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="Create a password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="bg-[oklch(0.96_0.008_250)] border-primary/30 focus:border-primary text-card-foreground placeholder:text-card-foreground/50"
							/>
						</div>

						{error && (
							<div className="rounded-sm border border-red-400/50 bg-red-50 p-3">
								<p className="text-sm font-serif-elegant text-red-800">
									{error.message}
								</p>
							</div>
						)}

						<Button
							type="submit"
							disabled={isPending}
							className="w-full bg-gradient-to-r from-primary via-secondary to-primary text-white shadow-[0_0_25px_oklch(0.55_0.18_240_/_0.5)] hover:shadow-[0_0_35px_oklch(0.55_0.18_240_/_0.7)] border-2 border-primary/60 font-serif-elegant tracking-wide transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating Account...
								</>
							) : (
								"Create Account"
							)}
						</Button>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
