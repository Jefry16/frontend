import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { Audience } from "#/audiences";
import { seedAllPages, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppAvailabilityEditor } from "./AppAvailabilityEditor";

const OP = "op-1";
const EXPERIENCE_ID = "e-1";

const EXPERIENCE = {
	id: EXPERIENCE_ID,
	context: "experiences",
	name: "Sunset Sailing Tour",
};

const AUDIENCES: Audience[] = [
	{
		id: "a-1",
		context: "audiences",
		name: "Adult",
		paxPerUnit: 1,
		createdAt: "2026-03-01T10:00:00Z",
	},
	{
		id: "a-2",
		context: "audiences",
		name: "Child",
		paxPerUnit: 1,
		createdAt: "2026-03-01T10:00:00Z",
	},
];

const clientWith = (audiences: Audience[]) => {
	const qc = storyQueryClient();
	qc.setQueryData(queryKeys.experience(OP, EXPERIENCE_ID), EXPERIENCE);
	seedAllPages(
		qc,
		queryKeys.audiences(OP),
		`/tour-operators/${OP}/audiences`,
		audiences,
	);
	return qc;
};

const meta = {
	title: "Slots/AppAvailabilityEditor",
	component: AppAvailabilityEditor,
	args: { tourOperatorId: OP, experienceId: EXPERIENCE_ID },
} satisfies Meta<typeof AppAvailabilityEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const decorate = (audiences: Audience[]) => (Story: React.ComponentType) => (
	<QueryClientProvider client={clientWith(audiences)}>
		<div className="mx-auto w-full max-w-3xl">
			<Story />
		</div>
	</QueryClientProvider>
);

export const Default: Story = { decorators: [decorate(AUDIENCES)] };

export const NoAudiences: Story = { decorators: [decorate([])] };
