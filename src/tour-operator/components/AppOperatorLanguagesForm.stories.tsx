import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";
import type { Language } from "#/reference";
import { AppOperatorLanguagesForm } from "./AppOperatorLanguagesForm";

const ALLOWLIST: Language[] = [
	{ id: "l-en", context: "languages", code: "en", name: "English" },
	{ id: "l-es", context: "languages", code: "es", name: "Spanish" },
	{ id: "l-fr", context: "languages", code: "fr", name: "French" },
	{ id: "l-it", context: "languages", code: "it", name: "Italian" },
];

const qc = new QueryClient({
	defaultOptions: { queries: { staleTime: Number.POSITIVE_INFINITY } },
});
qc.setQueryData(queryKeys.languages, ALLOWLIST);

const meta = {
	title: "TourOperator/AppOperatorLanguagesForm",
	component: AppOperatorLanguagesForm,
	args: {
		tourOperatorId: "op-1",
		locales: { primaryLocale: "en", supportedLocales: ["en", "es"] },
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
} satisfies Meta<typeof AppOperatorLanguagesForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleLanguage: Story = {
	args: {
		tourOperatorId: "op-1",
		locales: { primaryLocale: "en", supportedLocales: ["en"] },
	},
};
