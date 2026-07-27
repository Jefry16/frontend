import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppBackLink } from "./AppBackLink";

const meta = {
	title: "Shared/AppBackLink",
	component: AppBackLink,
	args: { to: "/", children: "Back to experiences" },
} satisfies Meta<typeof AppBackLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
