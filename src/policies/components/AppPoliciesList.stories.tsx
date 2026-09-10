import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { AppPoliciesList } from "./AppPoliciesList";

const qc = storyQueryClient();

const meta = {
	title: "Policies/AppPoliciesList",
	component: AppPoliciesList,
	args: { tourOperatorId: "op-1" },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="w-full">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppPoliciesList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
