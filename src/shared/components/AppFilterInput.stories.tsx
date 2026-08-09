import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppFilterInput } from "./AppFilterInput";

const meta = {
	title: "Shared/AppFilterInput",
	component: AppFilterInput,
	args: { placeholder: "Search…" },
	decorators: [
		(Story) => (
			<div className="w-64 rounded-md border bg-popover p-3">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof AppFilterInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// The compact input inside a column-filter popover — shorter than a form field
// because it sits in chrome, not in a form.
export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: "kayak" } };
