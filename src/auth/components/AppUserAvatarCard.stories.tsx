import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, type AuthUser } from "#/auth";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppUserAvatarCard } from "./AppUserAvatarCard";

const USER: AuthUser = {
	id: "u-1",
	context: "users",
	name: "Ada Lovelace",
	avatarUrl: null,
	language: "en",
	tourOperators: [],
};

const qc = storyQueryClient();
qc.setQueryData(queryKeys.authProfile, USER);

const meta = {
	title: "Auth/AppUserAvatarCard",
	component: AppUserAvatarCard,
	args: { avatarUrl: null },
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
} satisfies Meta<typeof AppUserAvatarCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const WithAvatar: Story = {
	args: { avatarUrl: "https://i.pravatar.cc/160?img=5" },
};
