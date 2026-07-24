import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppVerifyEmailNotice } from "./AppVerifyEmailNotice";

const qc = new QueryClient();

const meta = {
	title: "Auth/AppVerifyEmailNotice",
	component: AppVerifyEmailNotice,
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<Story />
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppVerifyEmailNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithEmail: Story = { args: { email: "ada@example.com" } };
export const NoEmail: Story = {};
