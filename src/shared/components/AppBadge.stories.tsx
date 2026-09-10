import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppBadge } from "./AppBadge";

const meta = {
	title: "Shared/AppBadge",
	component: AppBadge,
	args: { children: "Badge" },
} satisfies Meta<typeof AppBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: "default" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Outline: Story = { args: { variant: "outline" } };

export const Statuses: Story = {
	render: () => (
		<div className="flex gap-2">
			<AppBadge variant="default">Pending</AppBadge>
			<AppBadge variant="secondary">Accepted</AppBadge>
			<AppBadge variant="outline">Revoked</AppBadge>
		</div>
	),
};
