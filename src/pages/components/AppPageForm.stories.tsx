import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import type { Page } from "../types";
import { AppPageForm } from "./AppPageForm";

const PAGE: Page = {
	id: "p-1",
	context: "pages",
	title: "About us",
	handle: "about-us",
	body: "<h1>Who we are</h1>",
	seoTitle: null,
	seoDescription: null,
	status: "DRAFT",
	createdAt: "2026-07-20T10:00:00Z",
	updatedAt: "2026-07-20T10:00:00Z",
};

const qc = storyQueryClient();

const meta = {
	title: "Pages/AppPageForm",
	component: AppPageForm,
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
} satisfies Meta<typeof AppPageForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Create includes the permanent handle field.
export const Create: Story = {};

// Edit drops the handle (renames are a separate action) and adds the template.
export const Edit: Story = { args: { page: PAGE } };
