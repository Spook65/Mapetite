const feedbackUrl = import.meta.env.VITE_FEEDBACK_URL?.trim();

export function MapetiteFooter() {
	return (
		<footer className="mt-auto border-t border-[rgba(255,236,220,0.08)]">
			<div className="mapetite-container px-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] md:px-6 md:py-8">
				<div className="mapetite-panel-soft grid justify-items-center gap-4 px-5 py-5 text-center">
					<div className="mx-auto grid max-w-4xl gap-2 text-[12px] leading-5 text-[var(--mapetite-text-faint)]">
						<p>&copy; 2026 Brandon Hann. Mapetite. Portfolio MVP demo.</p>
						<p>
							Restaurant and location data &copy;{" "}
							<a
								href="https://www.openstreetmap.org/copyright"
								target="_blank"
								rel="noreferrer"
								className="text-[var(--mapetite-text-soft)] underline decoration-[rgba(213,154,104,0.35)] underline-offset-4 hover:text-[var(--mapetite-text)]"
							>
								OpenStreetMap contributors
							</a>
							. Powered by{" "}
							<a
								href="https://www.geoapify.com/"
								target="_blank"
								rel="noreferrer"
								className="text-[var(--mapetite-text-soft)] underline decoration-[rgba(213,154,104,0.35)] underline-offset-4 hover:text-[var(--mapetite-text)]"
							>
								Geoapify
							</a>
							.
						</p>
						<p>
							Restaurant names and trademarks belong to their respective owners.
							 Mapetite is not affiliated with listed restaurants.
						</p>
						<p>
							Portfolio MVP demo. Results may vary by region. Accounts and favorites
							 are demo-level and may reset.
						</p>
					</div>

					{feedbackUrl ? (
						<a
							href={feedbackUrl}
							target="_blank"
							rel="noreferrer"
							className="mapetite-quiet-button inline-flex min-h-10 items-center justify-center rounded-[10px] border px-4 text-sm"
						>
							Send feedback
						</a>
					) : null}
				</div>
			</div>
		</footer>
	);
}
