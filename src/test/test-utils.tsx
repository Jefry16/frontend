import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { TooltipProvider } from "#/components/ui/tooltip";

interface ProvidersOptions {
	queryClient?: QueryClient;
}

export const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0, staleTime: Number.POSITIVE_INFINITY },
			mutations: { retry: false },
		},
	});

const Providers = ({
	children,
	queryClient,
}: ProvidersOptions & { children: ReactNode }) => (
	<QueryClientProvider client={queryClient ?? createTestQueryClient()}>
		<TooltipProvider>{children}</TooltipProvider>
	</QueryClientProvider>
);

export const renderWithProviders = (
	ui: ReactElement,
	options: ProvidersOptions & Omit<RenderOptions, "wrapper"> = {},
) => {
	const { queryClient, ...rtlOptions } = options;
	const qc = queryClient ?? createTestQueryClient();
	const utils = render(ui, {
		...rtlOptions,
		wrapper: ({ children }) => (
			<Providers queryClient={qc}>{children}</Providers>
		),
	});
	return { ...utils, queryClient: qc };
};

export const wrapperWithProviders = (options: ProvidersOptions = {}) => {
	const qc = options.queryClient ?? createTestQueryClient();
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<Providers queryClient={qc}>{children}</Providers>
	);
	return { Wrapper, queryClient: qc };
};
