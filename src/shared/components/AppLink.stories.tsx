import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppLink } from "./AppLink";

// The app-styled router link (typed against the route tree). The framework's
// memory router lets it render standalone in Storybook.
const meta = {
	title: "Shared/AppLink",
	component: AppLink,
	render: () => <AppLink to="/auth/login">Back to sign in</AppLink>,
} satisfies Meta<typeof AppLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
