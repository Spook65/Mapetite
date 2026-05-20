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
			<DialogContent className="gap-0 overflow-hidden border-[rgba(255,236,220,0.14)] bg-[rgba(28,22,18,0.96)] p-0 text-[var(--mapetite-text)] shadow-[0_24px_60px_rgba(0,0,0,0.34)] backdrop-blur sm:max-w-md">
				<DialogHeader className="gap-3 border-b border-[rgba(255,236,220,0.08)] bg-[linear-gradient(180deg,rgba(213,154,104,0.12),rgba(213,154,104,0.02))] px-6 py-6 text-left">
					<DialogTitle className="text-[28px] font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
						Welcome Back
					</DialogTitle>
					<DialogDescription className="max-w-sm text-sm leading-6 text-[var(--mapetite-text-soft)]">
						Sign in to access your saved restaurants.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
					<div className="space-y-2">
						<Label
							htmlFor="login-email"
							className="text-sm font-medium text-[var(--mapetite-text)]"
						>
							Email
						</Label>
						<Input
							id="login-email"
							type="email"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="h-11 rounded-[10px] border-[rgba(255,236,220,0.12)] bg-white/[0.05] px-3.5 text-[var(--mapetite-text)] placeholder:text-[var(--mapetite-text-faint)] focus-visible:border-[var(--mapetite-accent)] focus-visible:ring-[rgba(213,154,104,0.22)]"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="login-password"
							className="text-sm font-medium text-[var(--mapetite-text)]"
						>
							Password
						</Label>
						<Input
							id="login-password"
							type="password"
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="h-11 rounded-[10px] border-[rgba(255,236,220,0.12)] bg-white/[0.05] px-3.5 text-[var(--mapetite-text)] placeholder:text-[var(--mapetite-text-faint)] focus-visible:border-[var(--mapetite-accent)] focus-visible:ring-[rgba(213,154,104,0.22)]"
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
						className="mapetite-accent-button h-11 w-full rounded-[10px] text-sm font-semibold text-[#20140d] hover:text-[#20140d]"
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
