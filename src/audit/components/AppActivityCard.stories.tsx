import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppActivityCard } from "./AppActivityCard";

const OP = "op-1";
const ENTITY = "e-1";

const qc = storyQueryClient();
qc.setQueryData(queryKeys.activityTimeline(OP, "EXPERIENCE", ENTITY), {
	pages: [
		{
			data: [
				{
					id: "a-1",
					context: "audit-log-entries",
					actorType: "USER",
					actorId: "u-1",
					actorName: "Maria Ops",
					entityType: "EXPERIENCE",
					entityId: ENTITY,
					action: "experience.updated",
					details: null,
					changes: [{ field: "name", from: "Old", to: "New" }],
					requestId: null,
					createdAt: "2026-07-25T18:30:00Z",
				},
			],
			nextCursor: null,
		},
	],
	pageParams: [null],
});

const meta = {
	title: "Audit/AppActivityCard",
	component: AppActivityCard,
	args: { tourOperatorId: OP, entityType: "EXPERIENCE", entityId: ENTITY },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppActivityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
