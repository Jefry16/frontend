import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import {
	Toaster,
	TooltipProvider,
	UiDataProvider,
	UiLabelsProvider,
	UiNavigationProvider,
} from "@vointika/ui";
import type { ReactElement, ReactNode } from "react";
import { AuthProvider, type AuthUser } from "#/auth";
import { queryKeys } from "#/lib/query-keys";
import { setAccessToken } from "#/lib/tokens";
import { appUiData } from "#/ui-data";
import { appUiLabels } from "#/ui-labels";

interface ProvidersOptions {
	queryClient?: QueryClient;
	withAuth?: boolean;
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
	// A real Toaster, not a mock: useAppToast calls sonner's toast from inside
	// @vointika/ui, a module a test file cannot reach with vi.mock("sonner", …)
	// once this app stops declaring sonner itself. Assert on the rendered
	// sentence instead.
	const inner = (
		<TooltipProvider>
			{children}
			<Toaster />
		</TooltipProvider>
	);
	return (
		<UiLabelsProvider labels={appUiLabels}>
			<QueryClientProvider client={qc}>
				<UiDataProvider client={appUiData}>
					<UiNavigationProvider navigation={{ back: () => {} }}>
						{auth ? <AuthProvider>{inner}</AuthProvider> : inner}
					</UiNavigationProvider>
				</UiDataProvider>
			</QueryClientProvider>
		</UiLabelsProvider>
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
