import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { queryKeys } from "#/lib/query-keys";
import type { Slot } from "../types";
import { AppSlotsList } from "./AppSlotsList";

const OP_ID = "op-1";

const SLOTS: Slot[] = [
	{
		id: "s-1",
		context: "slots",
		experienceId: "e-1",
		experienceName: "Sunset Sailing Tour",
		experienceDescription: "Golden-hour cruise along the coast.",
		startAt: "2026-08-01T18:00:00",
		endAt: "2026-08-01T20:30:00",
		day: 6,
		durationMinutes: 150,
		status: "AVAILABLE",
		audiencePrices: [
			{
				audienceId: "a-1",
				audienceName: "Adult",
				price: 65,
				capacity: 20,
				paxPerUnit: 1,
				bookedCount: 12,
			},
			{
				audienceId: "a-2",
				audienceName: "Child",
				price: 35,
				capacity: 10,
				paxPerUnit: 1,
				bookedCount: 3,
			},
		],
	},
	{
		id: "s-2",
		context: "slots",
		experienceId: "e-2",
		experienceName: "Old Town Food Walk",
		experienceDescription: "Tastings across the historic quarter.",
		startAt: "2026-08-02T10:00:00",
		endAt: "2026-08-02T13:00:00",
		day: 0,
		durationMinutes: 180,
		status: "SOLD_OUT",
		audiencePrices: [
			{
				audienceId: "a-1",
				audienceName: "Adult",
				price: 89,
				capacity: 12,
				paxPerUnit: 1,
				bookedCount: 12,
			},
		],
	},
	{
		id: "s-3",
		context: "slots",
		experienceId: "e-1",
		experienceName: "Sunset Sailing Tour",
		experienceDescription: "Golden-hour cruise along the coast.",
		startAt: "2026-08-03T18:00:00",
		endAt: "2026-08-03T20:30:00",
		day: 1,
		durationMinutes: 150,
		status: "CANCELLED",
		audiencePrices: [
			{
				audienceId: "a-1",
				audienceName: "Adult",
				price: 65,
				capacity: 20,
				paxPerUnit: 1,
				bookedCount: 0,
			},
		],
	},
];

const qc = new QueryClient({
	defaultOptions: {
		queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
	},
});
qc.setQueryData(
	[
		...queryKeys.slots(OP_ID),
		`/tour-operators/${OP_ID}/slots`,
		[],
		[],
		undefined,
	],
	{ pages: [{ data: SLOTS, nextCursor: null }], pageParams: [null] },
);

const meta = {
	title: "Slots/AppSlotsList",
	component: AppSlotsList,
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
} satisfies Meta<typeof AppSlotsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
