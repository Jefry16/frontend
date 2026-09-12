import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Spinner } from "@vointika/ui";
import { AppAuthMessageCard } from "./AppAuthMessageCard";

const meta = {
	title: "Auth/AppAuthMessageCard",
	component: AppAuthMessageCard,
} satisfies Meta<typeof AppAuthMessageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Verifying: Story = {
	args: { icon: <Spinner />, description: "Verifying your email…" },
};

export const Success: Story = {
	args: {
		tone: "success",
		title: "Email verified",
		description: "Your email is confirmed. You can now sign in.",
	},
};

export const Failed: Story = {
	args: {
		tone: "destructive",
		title: "Verification failed",
		description: "This verification link is invalid or has expired.",
	},
};
