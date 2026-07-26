import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Audience } from "#/audiences";
import { AppSingleSlotForm } from "./AppSingleSlotForm";

const AUDIENCES: Audience[] = [
	{
		id: "a-1",
		context: "audiences",
		name: "Adult",
		paxPerUnit: 1,
		createdAt: "2026-03-01T10:00:00Z",
	},
];

const qc = new QueryClient();

const meta = {
	title: "Slots/AppSingleSlotForm",
	component: AppSingleSlotForm,
	args: {
		tourOperatorId: "op-1",
		experienceId: "e-1",
		durationMinutes: 150,
		audiences: AUDIENCES,
	},
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppSingleSlotForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
