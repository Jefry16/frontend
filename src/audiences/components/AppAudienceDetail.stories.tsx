import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { queryKeys } from "#/lib/query-keys";
import type { Audience } from "../types";
import { AppAudienceDetail } from "./AppAudienceDetail";

const OP = "op-1";
const AUD = "a-1";

const AUDIENCE: Audience = {
	id: AUD,
	context: "audiences",
	name: "VIP Table for 6",
	paxPerUnit: 6,
	createdAt: "2026-03-01T10:00:00Z",
};

const qc = new QueryClient({
	defaultOptions: {
		queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
	},
});
qc.setQueryData(queryKeys.audience(OP, AUD), AUDIENCE);
qc.setQueryData(queryKeys.activityTimeline(OP, "AUDIENCE", AUD), {
	pages: [{ data: [], nextCursor: null }],
	pageParams: [null],
});

const meta = {
	title: "Audiences/AppAudienceDetail",
	component: AppAudienceDetail,
	args: { tourOperatorId: OP, audienceId: AUD },
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
} satisfies Meta<typeof AppAudienceDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
