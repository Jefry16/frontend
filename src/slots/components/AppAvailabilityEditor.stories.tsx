import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Audience } from "#/audiences";
import { queryKeys } from "#/lib/query-keys";
import { AppAvailabilityEditor } from "./AppAvailabilityEditor";

const OP = "op-1";
const EXPERIENCE_ID = "e-1";

// Only the fields the editor reads — the seeded object stands in for a full
// Experience response.
const EXPERIENCE = {
	id: EXPERIENCE_ID,
	context: "experiences",
	name: "Sunset Sailing Tour",
	durationMinutes: 150,
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
	const qc = new QueryClient({
		defaultOptions: {
			queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
		},
	});
	qc.setQueryData(queryKeys.experience(OP, EXPERIENCE_ID), EXPERIENCE);
	qc.setQueryData([...queryKeys.audiences(OP), "all-pages"], {
		pages: [{ data: audiences, nextCursor: null }],
		pageParams: [null],
	});
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

// No audiences yet → the prerequisite guard instead of the forms.
export const NoAudiences: Story = { decorators: [decorate([])] };
