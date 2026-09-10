import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import type { OperatorTranslation } from "../types";
import { AppOperatorTranslationForm } from "./AppOperatorTranslationForm";

const ES: OperatorTranslation = {
	locale: "es",
	slogan: "Vive el Caribe como un local",
	shortDescription: null,
	seoTitle: "Acme Tours — excursiones en Punta Cana",
	seoDescription: null,
	passwordMessage: null,
};

const UNTRANSLATED: OperatorTranslation = {
	locale: "fr",
	slogan: null,
	shortDescription: null,
	seoTitle: null,
	seoDescription: null,
	passwordMessage: null,
};

const qc = storyQueryClient();

const meta = {
	title: "TourOperator/AppOperatorTranslationForm",
	component: AppOperatorTranslationForm,
	args: {
		tourOperatorId: "op-1",
		locale: "es",
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
} satisfies Meta<typeof AppOperatorTranslationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Untranslated: Story = {
	args: { tourOperatorId: "op-1", locale: "fr", translation: UNTRANSLATED },
};
