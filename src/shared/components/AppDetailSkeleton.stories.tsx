import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppDetailSkeleton } from "./AppDetailSkeleton";

const meta = {
	title: "Shared/AppDetailSkeleton",
	component: AppDetailSkeleton,
	args: { fields: 4 },
} satisfies Meta<typeof AppDetailSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// The common case — a facts card holding four values.
export const FourFields: Story = {};

// A short record (an audience, a pickup location) reserves less height.
export const TwoFields: Story = { args: { fields: 2 } };
