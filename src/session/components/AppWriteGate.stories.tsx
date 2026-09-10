import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Card, CardContent } from "#/components/ui/card";
import { AppWriteGate } from "./AppWriteGate";

const meta = {
	title: "TourOperator/AppWriteGate",
	component: AppWriteGate,
	args: {
		children: (
			<Card>
				<CardContent>
					The edit form a member with write access sees.
				</CardContent>
			</Card>
		),
	},
} satisfies Meta<typeof AppWriteGate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Denied: Story = {};
