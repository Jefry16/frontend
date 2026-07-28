import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppMetaobjectFieldDialog } from "./AppMetaobjectFieldDialog";

const meta = {
	title: "Metaobjects/AppMetaobjectFieldDialog",
	component: AppMetaobjectFieldDialog,
	args: {
		open: true,
		onOpenChange: () => {},
		pending: false,
		errorMessage: null,
		onSubmit: () => {},
	},
} satisfies Meta<typeof AppMetaobjectFieldDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Add: Story = {};
export const Rename: Story = {
	args: {
		field: { key: "bio", type: "multi_line_text", name: "Bio" },
	},
};
export const KeyTaken: Story = {
	args: {
		errorMessage: "A field with this key already exists on this type.",
	},
};
