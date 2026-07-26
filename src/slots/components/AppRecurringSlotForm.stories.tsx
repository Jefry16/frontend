import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Audience } from "#/audiences";
import { AppRecurringSlotForm } from "./AppRecurringSlotForm";

const AUDIENCES: Audience[] = [
	{
		id: "a-1",
		context: "audiences",
		name: "Adult",
		paxPerUnit: 1,
		createdAt: "2026-03-01T10:00:00Z",
	},
	{
		id: "a-2",
		context: "audiences",
		name: "Child",
		paxPerUnit: 1,
		createdAt: "2026-03-01T10:00:00Z",
	},
];

const qc = new QueryClient();

const meta = {
	title: "Slots/AppRecurringSlotForm",
	component: AppRecurringSlotForm,
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
} satisfies Meta<typeof AppRecurringSlotForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
