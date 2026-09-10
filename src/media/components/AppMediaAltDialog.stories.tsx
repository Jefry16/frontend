import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppMediaAltDialog } from "./AppMediaAltDialog";

const meta = {
	title: "Media/AppMediaAltDialog",
	component: AppMediaAltDialog,
	args: {
		open: true,
		onOpenChange: () => {},
		currentAlt: null,
		pending: false,
		onSave: () => {},
	},
} satisfies Meta<typeof AppMediaAltDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Undescribed: Story = {};

export const Described: Story = {
	args: { currentAlt: "Kayakers paddling past a limestone cliff at sunrise" },
};

export const Saving: Story = {
	args: { currentAlt: "A description being replaced", pending: true },
};
