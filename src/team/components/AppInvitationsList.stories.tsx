import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Invitation } from "../types";
import { AppInvitationsList } from "./AppInvitationsList";

const OP_ID = "op-1";

const inviter = {
	id: "u-owner",
	context: "users" as const,
	name: "Ada Lovelace",
};

const INVITATIONS: Invitation[] = [
	{
		id: "inv-1",
		context: "invitations",
		email: "grace@acme.test",
		name: "Grace Hopper",
		role: "ADMIN",
		status: "PENDING",
		expired: false,
		createdAt: "2026-03-01T09:00:00Z",
		expiresAt: "2026-03-08T09:00:00Z",
		acceptedAt: null,
		invitedBy: inviter,
	},
	{
		id: "inv-2",
		context: "invitations",
		email: "alan@acme.test",
		name: "Alan Turing",
		role: "STAFF",
		status: "ACCEPTED",
		expired: false,
		createdAt: "2026-02-10T12:00:00Z",
		expiresAt: "2026-02-17T12:00:00Z",
		acceptedAt: "2026-02-11T08:30:00Z",
		invitedBy: inviter,
	},
	{
		id: "inv-3",
		context: "invitations",
		email: "katherine@acme.test",
		name: "Katherine Johnson",
		role: "STAFF",
		// A lapsed PENDING row → shown as EXPIRED.
		status: "PENDING",
		expired: true,
		createdAt: "2026-01-05T10:00:00Z",
		expiresAt: "2026-01-12T10:00:00Z",
		acceptedAt: null,
		invitedBy: inviter,
	},
];

// staleTime: Infinity so the seeded page is treated as fresh — no background
// refetch (which would fail with no network and surface an error row).
const qc = storyQueryClient();
// Seed the infinite-query cache under the exact key useDataTable builds on first
// render (queryKey + endpoint + empty sorting/filters + undefined baseParams).
qc.setQueryData(
	[
		...queryKeys.invitations(OP_ID),
		`/tour-operators/${OP_ID}/invitations`,
		[],
		[],
		undefined,
	],
	listPage(INVITATIONS),
);

const meta = {
	title: "Team/AppInvitationsList",
	component: AppInvitationsList,
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
} satisfies Meta<typeof AppInvitationsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
