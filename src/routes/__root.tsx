import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
	component: Root,
});

function Root() {
	return (
		<div className="flex flex-col min-h-screen w-full overflow-x-clip">
			<ErrorBoundary tagName="main" className="flex-1 w-full">
				<Outlet />
			</ErrorBoundary>
			<TanStackRouterDevtools position="bottom-right" />
			<Toaster />
		</div>
	);
}
