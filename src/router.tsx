import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { AppRoutePending } from "@vointika/ui";
import { transientFailureRetry } from "./lib/query-retry";
import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: transientFailureRetry } },
});

export const router = createRouter({
	routeTree,
	scrollRestoration: true,
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
	defaultPendingComponent: AppRoutePending,
	context: { queryClient },
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
