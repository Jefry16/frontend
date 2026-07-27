import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, type AuthUser } from "#/auth";
import { SidebarProvider } from "#/components/ui/sidebar";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppTourOperatorSidebar } from "./AppTourOperatorSidebar";

const USER: AuthUser = {
	id: "u-1",
	context: "users",
	name: "Ada Lovelace",
	avatarUrl: null,
	language: "en",
	tourOperators: [
		{
			id: "op-1",
			name: "Acme Tours",
			logoUrl: null,
			timezone: "UTC",
			isDefault: true,
			role: "OWNER",
		},
	],
};

const qc = storyQueryClient();
qc.setQueryData(queryKeys.authProfile, USER);

// The nav is driven by the current-operator route param, which the framework's
// memory router resolves at "/" — so here the sidebar shows just the switcher;
// the full nav renders in the running app under an operator route.
const meta = {
	title: "TourOperator/AppTourOperatorSidebar",
	component: AppTourOperatorSidebar,
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<SidebarProvider>
						<Story />
					</SidebarProvider>
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppTourOperatorSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
