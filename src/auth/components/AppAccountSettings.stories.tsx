import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, type AuthUser } from "#/auth";
import { queryKeys } from "#/lib/query-keys";
import { AppAccountSettings } from "./AppAccountSettings";

const USER: AuthUser = {
	id: "u-1",
	context: "users",
	name: "Ada Lovelace",
	avatarUrl: "https://i.pravatar.cc/160?img=5",
	language: "en",
	tourOperators: [],
};

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
qc.setQueryData(queryKeys.authProfile, USER);

const meta = {
	title: "Auth/AppAccountSettings",
	component: AppAccountSettings,
	args: { tourOperatorId: "op-1" },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<div className="mx-auto w-full max-w-3xl">
						<Story />
					</div>
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppAccountSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
