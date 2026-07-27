import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { PickupLocation } from "../types";
import { AppPickupLocationEdit } from "./AppPickupLocationEdit";

const OP = "op-1";
const PICKUP = "p-1";

const PICKUP_LOCATION: PickupLocation = {
	id: PICKUP,
	context: "pickup-locations",
	name: "Old Port",
	time: "09:30:00",
	createdAt: "2026-03-01T10:00:00Z",
};

const qc = storyQueryClient();
qc.setQueryData(queryKeys.pickupLocation(OP, PICKUP), PICKUP_LOCATION);

const meta = {
	title: "PickupLocations/AppPickupLocationEdit",
	component: AppPickupLocationEdit,
	args: { tourOperatorId: OP, pickupLocationId: PICKUP },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppPickupLocationEdit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
