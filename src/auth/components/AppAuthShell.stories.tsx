import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Card, CardContent } from "@vointika/ui";
import { AppAuthShell } from "./AppAuthShell";

const meta = {
	title: "Auth/AppAuthShell",
	component: AppAuthShell,
	args: {
		children: (
			<Card>
				<CardContent>Whatever the screen puts under the logo.</CardContent>
			</Card>
		),
	},
} satisfies Meta<typeof AppAuthShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHeading: Story = {
	args: {
		title: "Welcome back",
		subtitle: "Sign in to your account",
	},
};

export const LogoOnly: Story = {};

export const Wide: Story = {
	args: {
		width: "lg",
		title: "Create your tour operator",
		subtitle: "Tell us about your business",
	},
};
