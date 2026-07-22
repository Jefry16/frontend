import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppResetPasswordForm } from "./AppResetPasswordForm";

// Connected: submits a mutation + navigates (router + React Query from the
// framework/preview; no useAuth). Two meaningful states: a valid link (the
// form) and a link with no token (the invalid-link card).
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
