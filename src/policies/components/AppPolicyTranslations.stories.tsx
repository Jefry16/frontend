import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Policy, PolicyTranslation } from "../types";
import { AppPolicyTranslations } from "./AppPolicyTranslations";

const OP = "op-1";
const ID = "pol-1";

const POLICY: Policy = {
	id: ID,
	context: "policies",
	type: "CANCELLATION",
	title: "Cancellation policy",
	body: "<p>Free up to 24 hours before departure.</p>",
	createdAt: "2026-08-01T10:00:00Z",
	updatedAt: "2026-08-05T10:00:00Z",
};

const ES: PolicyTranslation = {
	locale: "es",
	title: "Política de cancelación",
	body: null,
};

const seed = (supportedLocales: string[]) =>
	storyQueryClient((qc) => {
		qc.setQueryData(queryKeys.policy(OP, ID), POLICY);
		qc.setQueryData(queryKeys.policyTranslations(OP, ID), [ES]);
		qc.setQueryData(queryKeys.operatorLocales(OP), {
			primaryLocale: "en",
			supportedLocales,
		});
	});

const twoSecondaries = seed(["en", "es", "fr"]);
const primaryOnly = seed(["en"]);

const meta = {
	title: "Policies/AppPolicyTranslations",
	component: AppPolicyTranslations,
	args: { tourOperatorId: OP, policyId: ID, canWrite: true },
	decorators: [
		(Story) => (
			<QueryClientProvider client={twoSecondaries}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppPolicyTranslations>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Spanish overlaid, French not — the switcher's dots show which. */
export const Default: Story = {};

/** A STAFF member: the stored overlay, read-only. */
export const ReadOnly: Story = {
	args: { tourOperatorId: OP, policyId: ID, canWrite: false },
};

/** Only the primary language configured — nothing to translate onto. */
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
