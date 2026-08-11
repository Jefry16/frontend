import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, type AuthUser } from "#/auth";
import { SidebarProvider } from "#/components/ui/sidebar";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppSettingsSidebar } from "./AppSettingsSidebar";

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
			currency: "EUR",
			isDefault: true,
			role: "OWNER",
		},
	],
};

const qc = storyQueryClient();
qc.setQueryData(queryKeys.authProfile, USER);

// The current operator is resolved from the route param, which the framework's
// memory router leaves empty at "/", so here the rail shows its back header; the
// section list renders in the running app under a settings route.
const meta = {
	title: "TourOperator/AppSettingsSidebar",
	component: AppSettingsSidebar,
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
} satisfies Meta<typeof AppSettingsSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
