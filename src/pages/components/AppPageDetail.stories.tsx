import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Page } from "../types";
import { AppPageDetail } from "./AppPageDetail";

const OP = "op-1";
const PAGE_ID = "p-1";

const page = (overrides: Partial<Page>): Page => ({
	id: PAGE_ID,
	context: "pages",
	title: "About us",
	handle: "about-us",
	body: "<h1>Who we are</h1>\n<p>Family-run boat tours since 1998.</p>",
	seoTitle: "About our boat tours",
	seoDescription: "Family-run boat tours on the coast since 1998.",
	status: "PUBLISHED",
	templateSuffix: null,
	createdAt: "2026-07-20T10:00:00Z",
	updatedAt: "2026-07-25T10:00:00Z",
	...overrides,
});

const clientWith = (p: Page) =>
	storyQueryClient((qc) => {
		qc.setQueryData(queryKeys.pageDetail(OP, PAGE_ID), p);
		qc.setQueryData(
			queryKeys.activityTimeline(OP, "PAGE", PAGE_ID),
			listPage([]),
		);
	});

const meta = {
	title: "Pages/AppPageDetail",
	component: AppPageDetail,
	args: { tourOperatorId: OP, pageId: PAGE_ID },
} satisfies Meta<typeof AppPageDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

const decorate = (p: Page) => (Story: React.ComponentType) => (
	<QueryClientProvider client={clientWith(p)}>
		<div className="mx-auto w-full max-w-3xl">
			<Story />
		</div>
	</QueryClientProvider>
);

export const Published: Story = { decorators: [decorate(page({}))] };

export const Draft: Story = {
	decorators: [
		decorate(page({ status: "DRAFT", seoTitle: null, seoDescription: null })),
	],
};
