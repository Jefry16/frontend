import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppDetailSkeleton } from "./AppDetailSkeleton";

const meta = {
	title: "Shared/AppDetailSkeleton",
	component: AppDetailSkeleton,
	args: { fields: 4 },
} satisfies Meta<typeof AppDetailSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FourFields: Story = {};

export const TwoFields: Story = { args: { fields: 2 } };

export const Labelled: Story = { args: { fields: 3, variant: "labelled" } };
