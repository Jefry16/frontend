import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppLanguageCard } from "./AppLanguageCard";

function client(languages: string[]) {
	const qc = storyQueryClient();
	qc.setQueryData(queryKeys.uiLanguages, languages);
	return qc;
}

const meta = {
	title: "Auth/AppLanguageCard",
	component: AppLanguageCard,
} satisfies Meta<typeof AppLanguageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Multiple: Story = {
	decorators: [
		(Story) => (
			<QueryClientProvider client={client(["en", "es", "fr", "it"])}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
};

export const SingleLanguage: Story = {
	decorators: [
		(Story) => (
			<QueryClientProvider client={client(["en"])}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
};
