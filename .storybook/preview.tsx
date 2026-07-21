import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Decorator, Preview } from "@storybook/tanstack-react";
import { TooltipProvider } from "#/components/ui/tooltip";
import { ThemeProvider } from "#/shared/theme";
import "../src/styles.css";

// Stories render inside the app's global providers (theme tokens, React Query,
// tooltips). The TanStack Router context is supplied automatically by the
// @storybook/tanstack-react framework, so route-aware components render without
// booting the app shell.
const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: false } },
});

const withProviders: Decorator = (Story) => (
	<ThemeProvider>
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Story />
			</TooltipProvider>
		</QueryClientProvider>
	</ThemeProvider>
);

const preview: Preview = {
	decorators: [withProviders],
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		a11y: {
			// 'todo' — show a11y violations in the addon panel only (don't fail).
			test: "todo",
		},
	},
};

export default preview;
