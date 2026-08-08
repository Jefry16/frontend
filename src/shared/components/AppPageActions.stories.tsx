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

// A page whose actions span both tiers: editing is ADMIN+, reading the
// translations is not.
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

// What an ADMIN+ sees: the whole set.
export const MixedTiersAsAdmin: Story = {
	args: { actions: MIXED_TIERS, canWrite: true },
};

// What a STAFF member sees: only the `member` action survives, and it takes the
// primary slot the ADMIN+ action vacated.
export const MixedTiersAsStaff: Story = {
	args: { actions: MIXED_TIERS, canWrite: false },
};
