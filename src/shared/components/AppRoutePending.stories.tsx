import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppRoutePending } from "./AppRoutePending";

const meta = {
	title: "Shared/AppRoutePending",
	component: AppRoutePending,
} satisfies Meta<typeof AppRoutePending>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
