import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppSourceBlock } from "./AppSourceBlock";

const meta = {
	title: "Shared/AppSourceBlock",
	component: AppSourceBlock,
	args: {
		label: "Policy body",
		children:
			"<h2>Refunds</h2>\n<p>Cancel at least 24 hours before departure for a full refund.</p>\n<ul>\n  <li>Weather cancellations are always refunded.</li>\n  <li>No-shows are not refundable.</li>\n</ul>",
	},
} satisfies Meta<typeof AppSourceBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Markup: Story = {};

export const Overflowing: Story = {
	args: {
		label: "Policy body",
		children: Array.from(
			{ length: 40 },
			(_, i) => `<p>Clause ${i + 1}.</p>`,
		).join("\n"),
	},
};
