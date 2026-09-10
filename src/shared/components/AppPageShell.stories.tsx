import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppPageShell } from "./AppPageShell";

const Block = ({ label }: { label: string }) => (
	<div className="rounded-md border bg-card p-6 text-sm text-muted-foreground">
		{label}
	</div>
);

const meta = {
	title: "Shared/AppPageShell",
	component: AppPageShell,
} satisfies Meta<typeof AppPageShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {
	args: {
		variant: "list",
		children: (
			<>
				<Block label="Page header" />
				<Block label="Data table (full width)" />
			</>
		),
	},
};

export const Detail: Story = {
	args: {
		variant: "detail",
		children: (
			<>
				<Block label="Page header" />
				<Block label="Facts card" />
				<Block label="Activity card" />
			</>
		),
	},
};

export const Form: Story = {
	args: {
		variant: "form",
		children: (
			<>
				<Block label="Page header" />
				<Block label="Form card" />
			</>
		),
	},
};
