import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { AuthProvider, type AuthUser } from "#/auth";
import { TooltipProvider } from "#/components/ui/tooltip";
import { queryKeys } from "#/lib/query-keys";
import { setAccessToken } from "#/lib/tokens";

interface ProvidersOptions {
	queryClient?: QueryClient;
	/**
	 * Wrap in AuthProvider — needed for anything that calls `useAuth`. Implied
	 * when `user` is set. Components using it must mock `useNavigate` (AuthProvider
	 * reads it) unless rendered under a real router.
	 */
	withAuth?: boolean;
	/** Seed an authenticated session: sets a token + primes the profile query. */
	user?: AuthUser;
}

export const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0, staleTime: Number.POSITIVE_INFINITY },
			mutations: { retry: false },
		},
	});

const seedAuth = (qc: QueryClient, user?: AuthUser) => {
	if (!user) return;
	setAccessToken("test-access-token");
	qc.setQueryData(queryKeys.authProfile, user);
};

const wrap = (qc: QueryClient, auth: boolean, children: ReactNode) => {
	const inner = <TooltipProvider>{children}</TooltipProvider>;
	return (
		<QueryClientProvider client={qc}>
			{auth ? <AuthProvider>{inner}</AuthProvider> : inner}
		</QueryClientProvider>
	);
};

export const renderWithProviders = (
	ui: ReactElement,
	options: ProvidersOptions & Omit<RenderOptions, "wrapper"> = {},
) => {
	const { queryClient, withAuth, user, ...rtlOptions } = options;
	const qc = queryClient ?? createTestQueryClient();
	seedAuth(qc, user);
	const auth = !!(withAuth || user);
	const utils = render(ui, {
		...rtlOptions,
		wrapper: ({ children }) => wrap(qc, auth, children),
	});
	return { ...utils, queryClient: qc };
};

export const wrapperWithProviders = (options: ProvidersOptions = {}) => {
	const qc = options.queryClient ?? createTestQueryClient();
	seedAuth(qc, options.user);
	const auth = !!(options.withAuth || options.user);
	const Wrapper = ({ children }: { children: ReactNode }) =>
		wrap(qc, auth, children);
	return { Wrapper, queryClient: qc };
};
