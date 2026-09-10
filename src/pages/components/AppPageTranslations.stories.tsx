import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Page, PageTranslation } from "../types";
import { AppPageTranslations } from "./AppPageTranslations";

const OP = "op-1";
const PAGE_ID = "p-1";

const PAGE: Page = {
	id: PAGE_ID,
	context: "pages",
	title: "About us",
	handle: "about-us",
	body: "<h1>Who we are</h1>",
	seoTitle: null,
	seoDescription: null,
	published: true,
	createdAt: "2026-07-20T10:00:00Z",
	updatedAt: "2026-07-20T10:00:00Z",
};

const ES: PageTranslation = {
	locale: "es",
	title: "Sobre nosotros",
	body: "<h1>Quiénes somos</h1>",
	seoTitle: null,
	seoDescription: null,
	handle: "sobre-nosotros",
};

const qc = storyQueryClient((qc) => {
	qc.setQueryData(queryKeys.pageDetail(OP, PAGE_ID), PAGE);
	qc.setQueryData(queryKeys.operatorDetails(OP), {
		locales: {
			primaryLocale: "en",
			supportedLocales: ["en", "es", "fr"],
		},
	});
	qc.setQueryData(queryKeys.pageTranslations(OP, PAGE_ID), [ES]);
	qc.setQueryData(queryKeys.pageTranslation(OP, PAGE_ID, "es"), ES);
	qc.setQueryData(queryKeys.pageTranslation(OP, PAGE_ID, "fr"), {
		locale: "fr",
		title: null,
		body: null,
		seoTitle: null,
		seoDescription: null,
		handle: null,
	});
});

const meta = {
	title: "Pages/AppPageTranslations",
	component: AppPageTranslations,
	args: { tourOperatorId: OP, pageId: PAGE_ID, canWrite: true },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppPageTranslations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A STAFF member: the stored overlay, read-only — reads are member-level. */
export const ReadOnly: Story = {
	args: { canWrite: false },
};
