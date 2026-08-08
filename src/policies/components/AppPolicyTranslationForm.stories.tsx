import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import type { Policy, PolicyTranslation } from "../types";
import { AppPolicyTranslationForm } from "./AppPolicyTranslationForm";

const CANONICAL: Policy = {
	id: "pol-1",
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

const UNTRANSLATED: PolicyTranslation = {
	locale: "fr",
	title: null,
	body: null,
};

const qc = storyQueryClient();

const meta = {
	title: "Policies/AppPolicyTranslationForm",
	component: AppPolicyTranslationForm,
	args: {
		tourOperatorId: "op-1",
		policyId: "pol-1",
		locale: "es",
		canonical: CANONICAL,
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
} satisfies Meta<typeof AppPolicyTranslationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Title overlaid, body still falling back — Clear is offered. */
export const Default: Story = {};

/** Nothing overlaid yet, so there is nothing to clear. */
export const Untranslated: Story = {
	args: {
		tourOperatorId: "op-1",
		policyId: "pol-1",
		locale: "fr",
		canonical: CANONICAL,
		translation: UNTRANSLATED,
	},
};
