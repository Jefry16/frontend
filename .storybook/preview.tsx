import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Decorator, Preview } from "@storybook/tanstack-react";
import { AuthProvider } from "#/auth";
import { TooltipProvider } from "#/components/ui/tooltip";
import { ThemeProvider } from "#/shared/theme";
import "../src/styles.css";

// Stories render inside the app's global providers (theme tokens, React Query,
// tooltips, auth). The TanStack Router context is supplied automatically by the
// @storybook/tanstack-react framework, so route-aware components render without
// booting the app shell.
const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: false } },
});

// `useAuth` throws outright without a provider, and nineteen stories reach it
// through usePermissions / useOperatorDateTime → useCurrentTourOperator. Until
// this was here they rendered Storybook's error node instead of the component.
//
// The real provider rather than a stub, matching `src/test/test-utils`: it
// refreshes on mount, that call has no session to find, and the stories settle
// unauthenticated. No fake user is seeded because none would change anything —
// `useCurrentTourOperator` resolves against the `$tourOperatorId` param, which
// the memory router leaves empty, so `canWrite` is false either way. That is
// the state these stories were written for.
const withProviders: Decorator = (Story) => (
	<ThemeProvider>
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<TooltipProvider>
					<Story />
				</TooltipProvider>
			</AuthProvider>
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
