import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppMenuRenameDialog } from "./AppMenuRenameDialog";

const meta = {
	title: "Menus/AppMenuRenameDialog",
	component: AppMenuRenameDialog,
	args: {
		open: true,
		onOpenChange: () => {},
		currentTitle: "Main menu",
		pending: false,
		onRename: () => {},
	},
} satisfies Meta<typeof AppMenuRenameDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
