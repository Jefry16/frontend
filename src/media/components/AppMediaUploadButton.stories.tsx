import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppMediaUploadButton } from "./AppMediaUploadButton";

const qc = new QueryClient();

const meta = {
	title: "Media/AppMediaUploadButton",
	component: AppMediaUploadButton,
	args: { tourOperatorId: "op-1" },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<Story />
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMediaUploadButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
