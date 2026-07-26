import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { queryKeys } from "#/lib/query-keys";
import type { Member } from "../types";
import { AppMemberDetail } from "./AppMemberDetail";

const OP_ID = "op-1";
const USER_ID = "u-2";

const MEMBER: Member = {
	id: USER_ID,
	context: "users",
	role: "ADMIN",
	joinedAt: "2026-01-05T10:00:00Z",
	name: "Grace Hopper",
	email: "grace@acme.test",
};

const qc = new QueryClient({
	defaultOptions: {
		queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
	},
});
qc.setQueryData(queryKeys.member(OP_ID, USER_ID), MEMBER);
qc.setQueryData(queryKeys.activityTimeline(OP_ID, "MEMBER", USER_ID), {
	pages: [{ data: [], nextCursor: null }],
	pageParams: [null],
});

const meta = {
	title: "Team/AppMemberDetail",
	component: AppMemberDetail,
	args: { tourOperatorId: OP_ID, userId: USER_ID },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<Story />
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMemberDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
