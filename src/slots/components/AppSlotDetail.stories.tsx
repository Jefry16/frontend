import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Slot } from "../types";
import { AppSlotDetail } from "./AppSlotDetail";

const OP = "op-1";
const SLOT_ID = "s-1";

const slot = (overrides: Partial<Slot>): Slot => ({
	id: SLOT_ID,
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
	...overrides,
});

const clientWith = (s: Slot) => {
	const qc = storyQueryClient();
	qc.setQueryData(queryKeys.slot(OP, SLOT_ID), s);
	qc.setQueryData(
		queryKeys.activityTimeline(OP, "SLOT", SLOT_ID),
		listPage([]),
	);
	return qc;
};

const meta = {
	title: "Slots/AppSlotDetail",
	component: AppSlotDetail,
	args: { tourOperatorId: OP, slotId: SLOT_ID },
} satisfies Meta<typeof AppSlotDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

const decorate = (s: Slot) => (Story: React.ComponentType) => (
	<QueryClientProvider client={clientWith(s)}>
		<AuthProvider>
			<div className="mx-auto w-full max-w-3xl">
				<Story />
			</div>
		</AuthProvider>
	</QueryClientProvider>
);

export const Available: Story = { decorators: [decorate(slot({}))] };

export const SoldOut: Story = {
	decorators: [decorate(slot({ status: "SOLD_OUT" }))],
};

export const Cancelled: Story = {
	decorators: [decorate(slot({ status: "CANCELLED" }))],
};
