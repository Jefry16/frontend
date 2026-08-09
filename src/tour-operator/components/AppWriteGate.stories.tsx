import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Card, CardContent } from "#/components/ui/card";
import { AppWriteGate } from "./AppWriteGate";

// The gate reads the role off the `$tourOperatorId` route param, and the
// framework's memory router leaves that empty at "/", so every story here is
// the denied case — which is the state the component exists to produce. What a
// permitted member sees is just `children`, unchanged, and stories for those
// forms live under their own modules.
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

// A STAFF member who reached a create or edit URL anyway — from a bookmark, or
// by typing it. Hiding the button that leads here does not stop either.
export const Denied: Story = {};
