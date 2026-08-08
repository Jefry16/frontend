import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Policy } from "../types";
import { AppPolicyDetail } from "./AppPolicyDetail";

const OP = "op-1";
const ID = "pol-1";

const POLICY: Policy = {
	id: "pol-1",
	context: "policies",
	type: "CANCELLATION",
	title: "Cancellation policy",
	body: "<h2>Cancellations</h2>\\n<p>Free up to 24 hours before departure.</p>",
	createdAt: "2026-08-01T10:00:00Z",
	updatedAt: "2026-08-05T10:00:00Z",
};

const qc = storyQueryClient((c) => {
	c.setQueryData(queryKeys.policy(OP, ID), POLICY);
	c.setQueryData(
		queryKeys.activityTimeline(OP, "TOUR_OPERATOR", OP),
		listPage([]),
	);
});

const meta = {
	title: "Policies/AppPolicyDetail",
	component: AppPolicyDetail,
	args: { tourOperatorId: OP, policyId: ID },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppPolicyDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
