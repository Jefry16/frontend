import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppResourceLink } from "./AppResourceLink";

const meta = {
	title: "Shared/AppResourceLink",
	component: AppResourceLink,
	render: () => (
		<AppResourceLink to="/auth/login">Ada Lovelace</AppResourceLink>
	),
} satisfies Meta<typeof AppResourceLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
