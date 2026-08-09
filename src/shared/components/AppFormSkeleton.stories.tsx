import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { AppFormSkeleton } from "./AppFormSkeleton";

const meta = {
	title: "Shared/AppFormSkeleton",
	component: AppFormSkeleton,
	args: { rows: 3 },
} satisfies Meta<typeof AppFormSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// The common case — an edit form of three fields, waiting on its record.
export const ThreeRows: Story = {};

// A longer form (an experience) reserves more height.
export const FourRows: Story = { args: { rows: 4 } };

// Inside a settings card, where AppCardBody renders into an open CardContent:
// the title stays visible and only the body is a placeholder.
export const InsideACard: Story = {
	args: { card: false },
	render: (args) => (
		<Card>
			<CardHeader>
				<CardTitle>Search engine listing</CardTitle>
			</CardHeader>
			<CardContent>
				<AppFormSkeleton {...args} />
			</CardContent>
		</Card>
	),
};
