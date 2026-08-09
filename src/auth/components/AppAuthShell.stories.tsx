import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Card, CardContent } from "#/components/ui/card";
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

// The sign-in and register shape: logo, heading, subtitle.
export const WithHeading: Story = {
	args: {
		title: "Welcome back",
		subtitle: "Sign in to your account",
	},
};

// AppAuthMessageCard drops the heading — a verification result puts its own
// title inside the card, next to the result icon.
export const LogoOnly: Story = {};

// Onboarding: four fields need the wider column.
export const Wide: Story = {
	args: {
		width: "lg",
		title: "Create your tour operator",
		subtitle: "Tell us about your business",
	},
};
