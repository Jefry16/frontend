import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Card, CardContent } from "#/components/ui/card";
import { AppWriteGate } from "./AppWriteGate";

// Every story here is the DENIED case: the gate reads the role off the
// `$tourOperatorId` param, which the memory router leaves empty. That is also
// the only state worth storying — permitted renders `children` unchanged.
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

// Hiding the button that leads here stops neither a bookmark nor a typed URL.
export const Denied: Story = {};
