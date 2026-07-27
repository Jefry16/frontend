import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Page } from "../types";
import { AppPageEdit } from "./AppPageEdit";

const OP = "op-1";
const PAGE_ID = "p-1";

const PAGE: Page = {
	id: PAGE_ID,
	context: "pages",
	title: "About us",
	handle: "about-us",
	body: "<h1>Who we are</h1>\n<p>Family-run boat tours since 1998.</p>",
	seoTitle: "About our boat tours",
	seoDescription: null,
	status: "DRAFT",
	templateSuffix: null,
	createdAt: "2026-07-20T10:00:00Z",
	updatedAt: "2026-07-20T10:00:00Z",
};

const qc = storyQueryClient((qc) =>
	qc.setQueryData(queryKeys.pageDetail(OP, PAGE_ID), PAGE),
);

const meta = {
	title: "Pages/AppPageEdit",
	component: AppPageEdit,
	args: { tourOperatorId: OP, pageId: PAGE_ID },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppPageEdit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
