import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Audience } from "../types";
import { AppAudienceForm } from "./AppAudienceForm";

const AUDIENCE: Audience = {
	id: "a-1",
	context: "audiences",
	name: "VIP Table for 6",
	paxPerUnit: 6,
	createdAt: "2026-03-01T10:00:00Z",
};

const qc = new QueryClient();

const meta = {
	title: "Audiences/AppAudienceForm",
	component: AppAudienceForm,
	args: { tourOperatorId: "op-1" },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppAudienceForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};
export const Edit: Story = { args: { audience: AUDIENCE } };
