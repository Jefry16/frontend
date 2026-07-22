import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, type AuthUser } from "#/auth";
import { SidebarProvider } from "#/components/ui/sidebar";
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
			isDefault: true,
			role: "OWNER",
		},
		{
			id: "op-2",
			name: "Blue Sky Excursions",
			logoUrl: null,
			timezone: "UTC",
			isDefault: false,
			role: "ADMIN",
		},
	],
};

// Seed the profile in the query cache so useAuth resolves to a signed-in user
// (React Query returns cached data even with the query disabled).
const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
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
