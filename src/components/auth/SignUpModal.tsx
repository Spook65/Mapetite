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
import { useId, useState } from "react";

interface SignUpModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SignUpModal({ open, onOpenChange }: SignUpModalProps) {
	const titleId = useId();
	const descriptionId = useId();
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
			<DialogContent
				aria-labelledby={titleId}
				aria-describedby={descriptionId}
				className="gap-0 overflow-hidden border-[rgba(255,236,220,0.14)] bg-[rgba(28,22,18,0.96)] p-0 text-[var(--mapetite-text)] shadow-[0_24px_60px_rgba(0,0,0,0.34)] backdrop-blur sm:max-w-md"
			>
				<DialogHeader className="gap-3 border-b border-[rgba(255,236,220,0.08)] bg-[linear-gradient(180deg,rgba(213,154,104,0.12),rgba(213,154,104,0.02))] px-6 py-6 text-left">
					<DialogTitle
						id={titleId}
						className="text-[28px] font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]"
					>
						Create Account
					</DialogTitle>
					<DialogDescription
						id={descriptionId}
						className="max-w-sm text-sm leading-6 text-[var(--mapetite-text-soft)]"
					>
						Create an account to save favorites and return to them later.
					</DialogDescription>
				</DialogHeader>

				{showSuccess ? (
					<div className="px-6 py-8 text-center">
						<div className="mb-4 flex justify-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-[14px] border border-[rgba(255,236,220,0.12)] bg-white/[0.05]">
								<svg
									className="h-8 w-8 text-[var(--mapetite-accent)]"
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
						<h3 className="mb-2 text-lg font-semibold text-[var(--mapetite-text)]">
							Account Created!
						</h3>
						<p className="text-sm text-[var(--mapetite-text-soft)]">
							Welcome to Mapetite
						</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
						<div className="space-y-2">
							<Label
								htmlFor="name"
								className="text-sm font-medium text-[var(--mapetite-text)]"
							>
								Name
							</Label>
							<Input
								id="name"
								type="text"
								placeholder="Enter your name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="h-11 rounded-[10px] border-[rgba(255,236,220,0.12)] bg-white/[0.05] px-3.5 text-[var(--mapetite-text)] placeholder:text-[var(--mapetite-text-faint)] focus-visible:border-[var(--mapetite-accent)] focus-visible:ring-[rgba(213,154,104,0.22)]"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="email"
								className="text-sm font-medium text-[var(--mapetite-text)]"
							>
								Email
							</Label>
							<Input
								id="email"
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
								htmlFor="password"
								className="text-sm font-medium text-[var(--mapetite-text)]"
							>
								Password
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="Create a password"
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
