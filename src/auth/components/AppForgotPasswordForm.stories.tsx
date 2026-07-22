import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppForgotPasswordForm } from "./AppForgotPasswordForm";

// Connected: submits a mutation + navigates. The router + React Query providers
// come from the framework + preview decorator, and the hook doesn't read
// useAuth, so no extra decorator is needed. The post-submit "check your inbox"
// confirmation is interaction-driven, so only the form state is shown here.
const meta = {
	title: "Auth/AppForgotPasswordForm",
	component: AppForgotPasswordForm,
} satisfies Meta<typeof AppForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
