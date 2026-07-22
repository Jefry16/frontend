import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Users } from "lucide-react";
import { Button } from "#/components/ui/button";
import { AppEmptyState } from "./AppEmptyState";

const meta = {
	title: "Shared/AppEmptyState",
	component: AppEmptyState,
	args: {
		icon: Users,
		title: "No team members yet",
		description: "Invite people to help run this tour operator.",
	},
} satisfies Meta<typeof AppEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
	args: {
		action: <Button>Invite a member</Button>,
	},
};

export const TitleOnly: Story = {
	args: { icon: undefined, description: undefined },
};
