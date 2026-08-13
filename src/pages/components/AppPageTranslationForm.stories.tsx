import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import type { Page, PageTranslation } from "../types";
import { AppPageTranslationForm } from "./AppPageTranslationForm";

const PAGE: Page = {
	id: "p-1",
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
	body: null,
	seoTitle: null,
	seoDescription: null,
	handle: "sobre-nosotros",
};

const qc = storyQueryClient();

const meta = {
	title: "Pages/AppPageTranslationForm",
	component: AppPageTranslationForm,
	args: {
		tourOperatorId: "op-1",
		pageId: "p-1",
		locale: "es",
		canonical: PAGE,
		translation: ES,
	},
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppPageTranslationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
