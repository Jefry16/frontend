import type { Meta, StoryObj } from "@storybook/tanstack-react";
import type { SlotAudiencePrice } from "../types";
import { AppEditCapacityDialog } from "./AppEditCapacityDialog";

const TIERS: SlotAudiencePrice[] = [
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
];

const meta = {
	title: "Slots/AppEditCapacityDialog",
	component: AppEditCapacityDialog,
	args: {
		open: true,
		onOpenChange: () => {},
		tiers: TIERS,
		pending: false,
		onSave: () => {},
	},
} satisfies Meta<typeof AppEditCapacityDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Saving: Story = { args: { pending: true } };
