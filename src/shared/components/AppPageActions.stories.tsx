import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Copy, Languages, Send, Trash2 } from "lucide-react";
import type { AppAction } from "./AppPageActions";
import { AppPageActions } from "./AppPageActions";

const meta = {
	title: "Shared/AppPageActions",
	component: AppPageActions,
	args: { canWrite: true },
} satisfies Meta<typeof AppPageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleAction: Story = {
	args: {
		actions: [{ id: "send", label: "Resend", icon: Send, onSelect: () => {} }],
	},
};

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

const MIXED_TIERS: AppAction[] = [
	{ id: "edit", label: "Edit", icon: Copy, onSelect: () => {} },
	{
		id: "translations",
		label: "Translations",
		icon: Languages,
		member: true,
		onSelect: () => {},
	},
	{
		id: "delete",
		label: "Delete",
		icon: Trash2,
		variant: "destructive",
		onSelect: () => {},
	},
];

export const MixedTiersAsAdmin: Story = {
	args: { actions: MIXED_TIERS, canWrite: true },
};

export const MixedTiersAsStaff: Story = {
	args: { actions: MIXED_TIERS, canWrite: false },
};
