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
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold text-foreground">
						Welcome Back
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Sign in to access your saved restaurants.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="login-email">Email</Label>
						<Input
							id="login-email"
							type="email"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="login-password">Password</Label>
						<Input
							id="login-password"
							type="password"
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					{error && (
						<div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
							<p className="text-sm text-destructive">
								{error.message}
							</p>
						</div>
					)}

					<Button
						type="submit"
						disabled={isPending}
						className="w-full"
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
