import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppConfirmDialog } from "./AppConfirmDialog";

const meta = {
	title: "Shared/AppConfirmDialog",
	component: AppConfirmDialog,
	args: {
		open: true,
		onOpenChange: () => {},
		onConfirm: () => {},
	},
} satisfies Meta<typeof AppConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Destructive: Story = {
	args: {
		title: "Revoke this invitation?",
		description:
			"The accept link will stop working immediately. This can't be undone.",
		confirmLabel: "Revoke",
		destructive: true,
	},
};

export const Pending: Story = {
	args: {
		title: "Revoke this invitation?",
		description: "The accept link will stop working immediately.",
		confirmLabel: "Revoke",
		destructive: true,
		pending: true,
	},
};
