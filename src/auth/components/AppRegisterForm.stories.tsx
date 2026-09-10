import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AuthProvider } from "../AuthProvider";
import { AppRegisterForm } from "./AppRegisterForm";

const meta = {
	title: "Auth/AppRegisterForm",
	component: AppRegisterForm,
	decorators: [
		(Story) => (
			<AuthProvider>
				<Story />
			</AuthProvider>
		),
	],
} satisfies Meta<typeof AppRegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
