import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import type { Policy } from "../types";
import { AppPolicyForm } from "./AppPolicyForm";

const POLICY: Policy = {
	id: "pol-1",
	context: "policies",
	type: "CANCELLATION",
	title: "Cancellation policy",
	body: "<h2>Cancellations</h2><p>Free up to 24 hours before departure.</p>",
	createdAt: "2026-08-01T10:00:00Z",
	updatedAt: "2026-08-05T10:00:00Z",
};

const qc = storyQueryClient();

const meta = {
	title: "Policies/AppPolicyForm",
	component: AppPolicyForm,
	args: { tourOperatorId: "op-1" },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppPolicyForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Create — the type picker is offered, because the type is the address. */
export const Create: Story = {};

/** Edit — no type picker: the address is fixed once written. */
export const Edit: Story = { args: { tourOperatorId: "op-1", policy: POLICY } };
