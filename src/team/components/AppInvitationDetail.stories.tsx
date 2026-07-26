import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { queryKeys } from "#/lib/query-keys";
import type { Invitation } from "../types";
import { AppInvitationDetail } from "./AppInvitationDetail";

const OP_ID = "op-1";
const INV_ID = "inv-1";

const INVITATION: Invitation = {
	id: INV_ID,
	context: "invitations",
	email: "grace@acme.test",
	name: "Grace Hopper",
	role: "ADMIN",
	status: "PENDING",
	expired: false,
	createdAt: "2026-03-01T09:00:00Z",
	expiresAt: "2026-03-08T09:00:00Z",
	acceptedAt: null,
	invitedBy: { id: "u-owner", context: "users", name: "Ada Lovelace" },
};

const qc = new QueryClient({
	defaultOptions: {
		queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
	},
});
qc.setQueryData(queryKeys.invitation(OP_ID, INV_ID), INVITATION);
qc.setQueryData(queryKeys.activityTimeline(OP_ID, "INVITATION", INV_ID), {
	pages: [{ data: [], nextCursor: null }],
	pageParams: [null],
});

const meta = {
	title: "Team/AppInvitationDetail",
	component: AppInvitationDetail,
	args: { tourOperatorId: OP_ID, invitationId: INV_ID },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<Story />
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppInvitationDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
