import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Member } from "../types";
import { AppMembersList } from "./AppMembersList";

const OP_ID = "op-1";

const MEMBERS: Member[] = [
	{
		id: "u-1",
		context: "users",
		role: "OWNER",
		joinedAt: "2026-01-05T10:00:00Z",
		name: "Ada Lovelace",
		email: "ada@acme.test",
	},
	{
		id: "u-2",
		context: "users",
		role: "ADMIN",
		joinedAt: "2026-02-14T09:30:00Z",
		name: "Grace Hopper",
		email: "grace@acme.test",
	},
	{
		id: "u-3",
		context: "users",
		role: "STAFF",
		joinedAt: "2026-03-01T08:00:00Z",
		name: null,
		email: "staff@acme.test",
	},
];

// staleTime: Infinity so the seeded page is treated as fresh — no background
// refetch (which would fail with no network and surface an error row).
const qc = storyQueryClient();
// Seed the infinite-query cache under the exact key useDataTable builds on first
// render (queryKey + endpoint + empty sorting/filters + undefined baseParams).
qc.setQueryData(
	[
		...queryKeys.members(OP_ID),
		`/tour-operators/${OP_ID}/members`,
		[],
		[],
		undefined,
	],
	listPage(MEMBERS),
);

const meta = {
	title: "Team/AppMembersList",
	component: AppMembersList,
	args: { tourOperatorId: OP_ID },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<Story />
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMembersList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
