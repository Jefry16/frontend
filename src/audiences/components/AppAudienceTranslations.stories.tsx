import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys, withLocale } from "#/lib/query-keys";
import type { Audience } from "../types";
import { AppAudienceTranslations } from "./AppAudienceTranslations";

const OP = "op-1";
const AUD = "a-1";

const AUDIENCE: Audience = {
	id: AUD,
	context: "audiences",
	name: "Adults",
	paxPerUnit: 1,
	createdAt: "2026-03-01T10:00:00Z",
};

function client() {
	const qc = storyQueryClient();
	qc.setQueryData(queryKeys.audience(OP, AUD), AUDIENCE);
	qc.setQueryData(queryKeys.operatorDetails(OP), {
		locales: {
			primaryLocale: "en",
			supportedLocales: ["en", "es"],
		},
	});
	const key = queryKeys.audienceTranslations(OP, AUD);
	qc.setQueryData(key, []);
	qc.setQueryData(withLocale(key, "es"), { locale: "es", name: null });
	return qc;
}

const meta = {
	title: "Audiences/AppAudienceTranslations",
	component: AppAudienceTranslations,
	args: { tourOperatorId: OP, audienceId: AUD, canWrite: true },
	decorators: [
		(Story) => (
			<QueryClientProvider client={client()}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppAudienceTranslations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ReadOnly: Story = {
	args: { canWrite: false },
};
