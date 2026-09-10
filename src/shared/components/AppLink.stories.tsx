import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppLink } from "./AppLink";

const meta = {
	title: "Shared/AppLink",
	component: AppLink,
	render: () => <AppLink to="/auth/login">Back to sign in</AppLink>,
} satisfies Meta<typeof AppLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
