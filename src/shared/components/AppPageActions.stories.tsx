import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Copy, Send, Trash2 } from "lucide-react";
import { AppPageActions } from "./AppPageActions";

const meta = {
	title: "Shared/AppPageActions",
	component: AppPageActions,
} satisfies Meta<typeof AppPageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

// One action → a single button, no overflow menu.
export const SingleAction: Story = {
	args: {
		actions: [{ id: "send", label: "Resend", icon: Send, onSelect: () => {} }],
	},
};

// Several → primary button + a "…" overflow holding the rest. The destructive
// action stays in the menu and gates behind a confirm dialog.
export const PrimaryPlusOverflow: Story = {
	args: {
		actions: [
			{ id: "send", label: "Resend", icon: Send, onSelect: () => {} },
			{ id: "copy", label: "Copy link", icon: Copy, onSelect: () => {} },
			{
				id: "revoke",
				label: "Revoke",
				icon: Trash2,
				variant: "destructive",
				confirm: {
					title: "Revoke this invitation?",
					description: "The accept link will stop working immediately.",
				},
				onSelect: () => {},
			},
		],
	},
};
