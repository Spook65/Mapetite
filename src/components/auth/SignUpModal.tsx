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
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold text-foreground">
						Create Account
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Create an account to save favorites and return to them later.
					</DialogDescription>
				</DialogHeader>

				{showSuccess ? (
					<div className="py-8 text-center">
						<div className="mb-4 flex justify-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-md border border-border bg-background">
								<svg
									className="h-8 w-8 text-primary"
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
						<h3 className="mb-2 text-lg font-semibold text-foreground">
							Account Created!
						</h3>
						<p className="text-sm text-muted-foreground">
							Welcome to Mapetite
						</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								type="text"
								placeholder="Enter your name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="Create a password"
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
