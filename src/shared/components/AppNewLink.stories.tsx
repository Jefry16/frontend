import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppNewLink } from "./AppNewLink";

const meta = {
	title: "Shared/AppNewLink",
	component: AppNewLink,
	args: { to: "/", children: "New audience" },
} satisfies Meta<typeof AppNewLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
