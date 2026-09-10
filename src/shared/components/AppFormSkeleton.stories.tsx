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

export const ThreeRows: Story = {};

export const FourRows: Story = { args: { rows: 4 } };

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
