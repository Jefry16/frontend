import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AuthProvider } from "#/auth";
import { AppTourOperatorForm } from "./AppTourOperatorForm";

// Connected: reads useAuth + fetches reference data. The story provides
// AuthProvider (router + query come from the framework + preview decorator).
const meta = {
	title: "TourOperator/AppTourOperatorForm",
	component: AppTourOperatorForm,
	decorators: [
		(Story) => (
			<AuthProvider>
				<Story />
			</AuthProvider>
		),
	],
} satisfies Meta<typeof AppTourOperatorForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
