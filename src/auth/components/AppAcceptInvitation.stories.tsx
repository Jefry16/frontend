import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppAcceptInvitation } from "./AppAcceptInvitation";

// The missing-token state renders without touching auth/network, so it stories
// standalone. The live preview/accept states need a token + backend.
const meta = {
	title: "Auth/AppAcceptInvitation",
	component: AppAcceptInvitation,
} satisfies Meta<typeof AppAcceptInvitation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MissingToken: Story = { args: { token: undefined } };
