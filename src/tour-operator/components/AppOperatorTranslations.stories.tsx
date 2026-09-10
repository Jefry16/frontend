import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { OperatorTranslation } from "../types";
import { AppOperatorTranslations } from "./AppOperatorTranslations";

const OP = "op-1";

const ES: OperatorTranslation = {
	locale: "es",
	slogan: "Vive el Caribe como un local",
	shortDescription: "Excursiones en barco y aventuras guiadas.",
	seoTitle: null,
	seoDescription: null,
	passwordMessage: "Abrimos muy pronto.",
};

const FR: OperatorTranslation = {
	locale: "fr",
	slogan: null,
	shortDescription: null,
	seoTitle: null,
	seoDescription: null,
	passwordMessage: null,
};

const seed = (supportedLocales: string[]) =>
	storyQueryClient((qc) => {
		qc.setQueryData(queryKeys.operatorDetails(OP), {
			locales: {
				primaryLocale: "en",
				supportedLocales,
			},
		});
		qc.setQueryData(queryKeys.operatorTranslations(OP), [ES]);
		qc.setQueryData(queryKeys.operatorTranslation(OP, "es"), ES);
		qc.setQueryData(queryKeys.operatorTranslation(OP, "fr"), FR);
	});

const twoSecondaries = seed(["en", "es", "fr"]);
const primaryOnly = seed(["en"]);

const meta = {
	title: "TourOperator/AppOperatorTranslations",
	component: AppOperatorTranslations,
	args: { tourOperatorId: OP, canWrite: true },
	decorators: [
		(Story) => (
			<QueryClientProvider client={twoSecondaries}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppOperatorTranslations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ReadOnly: Story = {
	args: { tourOperatorId: OP, canWrite: false },
};

export const SingleLanguage: Story = {
	decorators: [
		(Story) => (
			<QueryClientProvider client={primaryOnly}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
};
