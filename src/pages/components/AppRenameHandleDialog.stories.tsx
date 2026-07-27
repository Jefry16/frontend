import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppRenameHandleDialog } from "./AppRenameHandleDialog";

const meta = {
	title: "Pages/AppRenameHandleDialog",
	component: AppRenameHandleDialog,
	args: {
		open: true,
		onOpenChange: () => {},
		currentHandle: "about-us",
		pending: false,
		errorMessage: null,
		onRename: () => {},
	},
} satisfies Meta<typeof AppRenameHandleDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Taken: Story = {
	args: { errorMessage: "A page with this handle already exists" },
};
