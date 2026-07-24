import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Compass } from "lucide-react";
import { AppNotFound } from "./AppNotFound";

const meta = {
	title: "Shared/AppNotFound",
	component: AppNotFound,
	args: { resource: "Experience" },
} satisfies Meta<typeof AppNotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithIcon: Story = { args: { icon: Compass } };
