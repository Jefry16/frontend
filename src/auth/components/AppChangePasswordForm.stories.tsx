import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { AppChangePasswordForm } from "./AppChangePasswordForm";

const qc = storyQueryClient();

const meta = {
	title: "Auth/AppChangePasswordForm",
	component: AppChangePasswordForm,
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppChangePasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
