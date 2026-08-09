import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Card, CardContent } from "#/components/ui/card";
import { AppLoadingBlock } from "./AppLoadingBlock";

const meta = {
	title: "Shared/AppLoadingBlock",
	component: AppLoadingBlock,
	decorators: [
		(Story) => (
			<Card className="max-w-md">
				<CardContent>
					<Story />
				</CardContent>
			</Card>
		),
	],
} satisfies Meta<typeof AppLoadingBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

// What a translation editor shows while the next locale's overlay loads.
export const Default: Story = {};
