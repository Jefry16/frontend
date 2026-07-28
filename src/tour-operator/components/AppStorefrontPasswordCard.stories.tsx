import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppStorefrontPasswordCard } from "./AppStorefrontPasswordCard";

const OP = "op-1";

const qc = storyQueryClient((qc) =>
	qc.setQueryData(queryKeys.storefrontPassword(OP), {
		enabled: true,
		password: "sunset2026",
		message: "We're launching soon — check back in August.",
	}),
);

const meta = {
	title: "TourOperator/AppStorefrontPasswordCard",
	component: AppStorefrontPasswordCard,
	args: { tourOperatorId: OP },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppStorefrontPasswordCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
