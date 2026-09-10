import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import type { Category } from "../types";
import { AppCategoryForm } from "./AppCategoryForm";

const CATEGORY: Category = {
	id: "c-1",
	context: "categories",
	name: "Boat trips",
	handle: "boat-trips",
	createdAt: "2026-03-01T10:00:00Z",
};

const qc = storyQueryClient();

const meta = {
	title: "Categories/AppCategoryForm",
	component: AppCategoryForm,
	args: { tourOperatorId: "op-1" },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppCategoryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Create carries the hint: this is the only save that derives the handle. */
export const Create: Story = {};
export const Edit: Story = { args: { category: CATEGORY } };
