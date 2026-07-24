import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppBreadcrumb } from "./AppBreadcrumb";

const meta = {
	title: "Shared/AppBreadcrumb",
	component: AppBreadcrumb,
} satisfies Meta<typeof AppBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

// A non-navigable section label (muted) → a linked parent → the current page.
export const Default: Story = {
	args: {
		items: [
			{ label: "Content" },
			{
				label: "Media",
				to: "/tour-operators/$tourOperatorId/content/media",
				params: { tourOperatorId: "op-1" },
			},
			{ label: "ada-tour.png" },
		],
	},
};

// Two crumbs: a section and the current page.
export const SectionAndPage: Story = {
	args: {
		items: [{ label: "Content" }, { label: "Media" }],
	},
};
