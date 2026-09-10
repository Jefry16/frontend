import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppForgotPasswordForm } from "./AppForgotPasswordForm";

const meta = {
	title: "Auth/AppForgotPasswordForm",
	component: AppForgotPasswordForm,
} satisfies Meta<typeof AppForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
