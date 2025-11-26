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
import { useLogin } from "@/hooks/use-auth-api";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface LogInModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function LogInModal({ open, onOpenChange }: LogInModalProps) {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const {
		mutate: login,
		isPending,
		error,
	} = useLogin({
		onSuccess: (data) => {
			// Store the auth token
			localStorage.setItem("creao_auth_token", data.auth_token);

			// Close modal
			onOpenChange(false);

			// Clear form
			setEmail("");
			setPassword("");

			// Redirect to restaurants page
			navigate({ to: "/restaurants" });
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		login({ email, password });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md bg-card border-2 border-primary/40 shadow-[0_0_40px_oklch(0.55_0.18_240_/_0.3)]">
				<DialogHeader>
					<DialogTitle className="text-2xl font-serif-display text-card-foreground">
						Welcome Back
					</DialogTitle>
					<DialogDescription className="font-serif-elegant text-card-foreground/70">
						Sign in to access your personalized dining experience
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label
							htmlFor="login-email"
							className="font-serif-elegant text-card-foreground"
						>
							Email
						</Label>
						<Input
							id="login-email"
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
							htmlFor="login-password"
							className="font-serif-elegant text-card-foreground"
						>
							Password
						</Label>
						<Input
							id="login-password"
							type="password"
							placeholder="Enter your password"
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
								Signing In...
							</>
						) : (
							"Sign In"
						)}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
