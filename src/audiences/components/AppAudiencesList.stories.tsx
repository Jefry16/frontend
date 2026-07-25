import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { queryKeys } from "#/lib/query-keys";
import type { Audience } from "../types";
import { AppAudiencesList } from "./AppAudiencesList";

const OP_ID = "op-1";

const AUDIENCES: Audience[] = [
	{
		id: "a-1",
		context: "audiences",
		name: "Adults",
		paxPerUnit: 1,
		createdAt: "2026-03-01T10:00:00Z",
	},
	{
		id: "a-2",
		context: "audiences",
		name: "Children",
		paxPerUnit: 1,
		createdAt: "2026-03-02T10:00:00Z",
	},
	{
		id: "a-3",
		context: "audiences",
		name: "VIP Table for 6",
		paxPerUnit: 6,
		createdAt: "2026-04-11T09:00:00Z",
	},
];

const qc = new QueryClient({
	defaultOptions: {
		queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
	},
});
qc.setQueryData(
	[
		...queryKeys.audiences(OP_ID),
		`/tour-operators/${OP_ID}/audiences`,
		[],
		[],
		undefined,
	],
	{ pages: [{ data: AUDIENCES, nextCursor: null }], pageParams: [null] },
);

const meta = {
	title: "Audiences/AppAudiencesList",
	component: AppAudiencesList,
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
} satisfies Meta<typeof AppAudiencesList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
