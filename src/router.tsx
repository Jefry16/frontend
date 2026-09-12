import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { transientFailureRetry } from "./lib/query-retry";
import { routeTree } from "./routeTree.gen";
import { AppRoutePending } from "./shared/components/AppRoutePending";

export const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: transientFailureRetry } },
});

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultPendingComponent: AppRoutePending,
		context: { queryClient },
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
