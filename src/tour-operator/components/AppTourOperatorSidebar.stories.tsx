import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@vointika/ui";
import { AuthProvider, type AuthUser } from "#/auth";
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
			currency: "EUR",
			isDefault: true,
			role: "OWNER",
		},
	],
};

const qc = storyQueryClient();
qc.setQueryData(queryKeys.authProfile, USER);

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
