import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { OperatorSeo } from "../types";
import { AppOperatorSeoCard } from "./AppOperatorSeoCard";

const OP = "op-1";

const seed = (seo: OperatorSeo) =>
	storyQueryClient((qc) => {
		qc.setQueryData(queryKeys.operatorSeo(OP), seo);
	});

const filled = seed({
	seoTitle: "Acme Tours — sailing and diving in Punta Cana",
	seoDescription:
		"Small-group catamaran trips, guided dives and day tours since 2011.",
	ogImageMediaId: null,
});

const empty = seed({
	seoTitle: null,
	seoDescription: null,
	ogImageMediaId: null,
});

const meta = {
	title: "TourOperator/AppOperatorSeoCard",
	component: AppOperatorSeoCard,
	args: { tourOperatorId: OP, canWrite: true },
	decorators: [
		(Story) => (
			<QueryClientProvider client={filled}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppOperatorSeoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Both fields authored. */
export const Default: Story = {};

/** Nothing set yet — the storefront falls back to the shop name. */
export const Unset: Story = {
	decorators: [
		(Story) => (
			<QueryClientProvider client={empty}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
};

/** A STAFF member: the same settings, read-only. */
export const ReadOnly: Story = {
	args: { tourOperatorId: OP, canWrite: false },
};
