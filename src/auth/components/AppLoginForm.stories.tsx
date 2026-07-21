import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AuthProvider } from "../AuthProvider";
import { AppLoginForm } from "./AppLoginForm";

// Connected component: it reads `useAuth`, so the story provides AuthProvider
// (the router + query providers come from the framework + preview decorator).
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
