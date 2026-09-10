import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, type AuthUser } from "#/auth";
import { SidebarProvider } from "#/components/ui/sidebar";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppTourOperatorSwitcher } from "./AppTourOperatorSwitcher";

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
		{
			id: "op-2",
			name: "Blue Sky Excursions",
			logoUrl: null,
			timezone: "UTC",
			currency: "EUR",
			isDefault: false,
			role: "ADMIN",
		},
	],
};

const qc = storyQueryClient();
qc.setQueryData(queryKeys.authProfile, USER);

const meta = {
	title: "TourOperator/AppTourOperatorSwitcher",
	component: AppTourOperatorSwitcher,
	args: { activeId: "op-1" },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<SidebarProvider>
						<div className="w-64">
							<Story />
						</div>
					</SidebarProvider>
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppTourOperatorSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
