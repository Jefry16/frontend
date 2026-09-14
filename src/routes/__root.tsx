import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import {
	ThemeProvider,
	Toaster,
	TooltipProvider,
	UiDataProvider,
	UiLabelsProvider,
	useTheme,
} from "@vointika/ui";
import { AuthProvider } from "#/auth";
import { queryClient } from "#/router";
import { appUiData } from "#/ui-data";
import { appUiLabels } from "#/ui-labels";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
	{ component: RootLayout },
);

function ThemedToaster() {
	const { theme } = useTheme();
	return (
		<Toaster position="bottom-right" expand visibleToasts={9} theme={theme} />
	);
}

function RootLayout() {
	return (
		<ThemeProvider>
			<UiLabelsProvider labels={appUiLabels}>
				<QueryClientProvider client={queryClient}>
					<UiDataProvider client={appUiData}>
						<AuthProvider>
							<TooltipProvider>
								<Outlet />
								<ThemedToaster />
							</TooltipProvider>
						</AuthProvider>
					</UiDataProvider>
				</QueryClientProvider>
			</UiLabelsProvider>
			<TanStackDevtools
				config={{ position: "bottom-right" }}
				plugins={[
					{
						name: "Tanstack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
				]}
			/>
		</ThemeProvider>
	);
}
