import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FloatingBanner } from "@/components/FloatingBanner";
import { Toaster } from "@/components/ui/sonner";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
	component: Root,
});

function Root() {
	return (
		<div className="flex flex-col min-h-screen w-full overflow-x-hidden">
			<ErrorBoundary tagName="main" className="flex-1 w-full">
				<Outlet />
			</ErrorBoundary>
			<TanStackRouterDevtools position="bottom-right" />
			<FloatingBanner position="bottom-left" />
			<Toaster />
		</div>
	);
}
