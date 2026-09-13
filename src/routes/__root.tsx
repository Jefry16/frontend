import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import {
	ThemeProvider,
	Toaster,
	TooltipProvider,
	UiLabelsProvider,
	useTheme,
} from "@vointika/ui";
import { AuthProvider } from "#/auth";
import { getLocale } from "#/paraglide/runtime";
import { queryClient } from "#/router";
import { appUiLabels } from "#/ui-labels";

import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var s=window.localStorage.getItem('theme');var resolved=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
	{
		head: () => ({
			meta: [
				{ charSet: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ title: "Vointika" },
			],
			links: [{ rel: "stylesheet", href: appCss }],
		}),
		shellComponent: RootDocument,
	},
);

function ThemedToaster() {
	const { theme } = useTheme();
	return (
		<Toaster position="bottom-right" expand visibleToasts={9} theme={theme} />
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang={getLocale()} suppressHydrationWarning>
			<head>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: pre-paint FOUC guard, static string
					dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
				/>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider>
					<UiLabelsProvider labels={appUiLabels}>
						<QueryClientProvider client={queryClient}>
							<AuthProvider>
								<TooltipProvider>
									{children}
									<ThemedToaster />
								</TooltipProvider>
							</AuthProvider>
						</QueryClientProvider>
					</UiLabelsProvider>
				</ThemeProvider>
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
