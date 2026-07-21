import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppAuthFormWrapper } from "./AppAuthFormWrapper";

const meta = {
	title: "Auth/AppAuthFormWrapper",
	component: AppAuthFormWrapper,
	args: {
		form: { handleSubmit: () => {} },
		title: "Welcome back",
		subtitle: "Sign in to your account",
		submitLabel: "Sign in",
		isSubmitting: false,
		children: (
			<p className="text-sm text-muted-foreground">Form fields render here.</p>
		),
	},
} satisfies Meta<typeof AppAuthFormWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
	args: { errorMessage: "Invalid email or password" },
};

export const Submitting: Story = {
	args: { isSubmitting: true },
};
