import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Brand } from "../types";
import { AppOperatorBrandCard } from "./AppOperatorBrandCard";

const OP = "op-1";

const brand = (over: Partial<Brand> = {}): Brand => ({
	slogan: "Small boats, big water",
	shortDescription: "Guided kayak and snorkel trips along the north coast.",
	logoMediaId: null,
	squareLogoMediaId: null,
	faviconMediaId: null,
	coverImageMediaId: null,
	// Never edited here, but always echoed back — a brand sent in the PATCH
	// replaces the whole section.
	colors: { primary: [], secondary: [] },
	socialLinks: [],
	...over,
});

const qc = (b: Brand) =>
	storyQueryClient((c) =>
		c.setQueryData(queryKeys.operatorDetails(OP), { brand: b }),
	);

const meta = {
	title: "TourOperator/AppOperatorBrandCard",
	component: AppOperatorBrandCard,
	args: { tourOperatorId: OP, canWrite: true },
} satisfies Meta<typeof AppOperatorBrandCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Editable: Story = {
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc(brand())}>
				<Story />
			</QueryClientProvider>
		),
	],
};

// A brand nobody has filled in yet.
export const Empty: Story = {
	decorators: [
		(Story) => (
			<QueryClientProvider
				client={qc(brand({ slogan: null, shortDescription: null }))}
			>
				<Story />
			</QueryClientProvider>
		),
	],
};

// STAFF may read the brand but not write it.
export const ReadOnly: Story = {
	args: { canWrite: false },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc(brand())}>
				<Story />
			</QueryClientProvider>
		),
	],
};
