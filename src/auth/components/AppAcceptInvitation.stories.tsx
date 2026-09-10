import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppAcceptInvitation } from "./AppAcceptInvitation";

const meta = {
	title: "Auth/AppAcceptInvitation",
	component: AppAcceptInvitation,
} satisfies Meta<typeof AppAcceptInvitation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MissingToken: Story = { args: { token: undefined } };
