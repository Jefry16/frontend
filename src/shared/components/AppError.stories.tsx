import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppError } from "./AppError";

const meta = {
	title: "Shared/AppError",
	component: AppError,
} satisfies Meta<typeof AppError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithRetry: Story = {
	args: {
		description: "The server took too long to respond.",
		onRetry: () => {},
	},
};
