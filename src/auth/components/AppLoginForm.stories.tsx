import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AuthProvider } from "../AuthProvider";
import { AppLoginForm } from "./AppLoginForm";

const meta = {
	title: "Auth/AppLoginForm",
	component: AppLoginForm,
	decorators: [
		(Story) => (
			<AuthProvider>
				<Story />
			</AuthProvider>
		),
	],
} satisfies Meta<typeof AppLoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
