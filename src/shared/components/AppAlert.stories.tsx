import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppAlert } from "./AppAlert";

const meta = {
	title: "Shared/AppAlert",
	component: AppAlert,
	args: {
		variant: "destructive",
		title: "Couldn't save changes",
		description:
			"The server rejected the request. Check the highlighted fields and try again.",
	},
} satisfies Meta<typeof AppAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Destructive: Story = {};

export const Warning: Story = {
	args: {
		variant: "warning",
		title: "Currency change applies to new checkouts only",
		description: "Past payments keep the currency they were taken in.",
	},
};

export const Info: Story = {
	args: {
		variant: "info",
		title: "Expecting to join a team?",
		description:
			"If someone else is setting up your tour operator, you'll be invited by email — just wait for the invitation.",
	},
};
