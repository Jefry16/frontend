import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppResetPasswordForm } from "./AppResetPasswordForm";

const meta = {
	title: "Auth/AppResetPasswordForm",
	component: AppResetPasswordForm,
} satisfies Meta<typeof AppResetPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithToken: Story = {
	args: { token: "a-valid-looking-token" },
};

export const MissingToken: Story = {
	args: { token: undefined },
};
