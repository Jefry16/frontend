import type { Meta, StoryObj } from "@storybook/tanstack-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { AppDialogFooter } from "./AppDialogFooter";

const meta = {
	title: "Shared/AppDialogFooter",
	component: AppDialogFooter,
	args: { onConfirm: () => {} },
	decorators: [
		(Story) => (
			<Dialog open>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Rename this menu</DialogTitle>
					</DialogHeader>
					<Story />
				</DialogContent>
			</Dialog>
		),
	],
} satisfies Meta<typeof AppDialogFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// An unchanged or invalid form: confirm is out, Cancel still works.
export const ConfirmDisabled: Story = { args: { disabled: true } };

// Mid-save: both are out, so nothing races the request.
export const Pending: Story = { args: { pending: true } };

export const Destructive: Story = {
	args: { destructive: true, confirmLabel: "Delete policy" },
};
