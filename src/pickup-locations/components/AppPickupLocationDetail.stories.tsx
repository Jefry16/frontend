import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { queryKeys } from "#/lib/query-keys";
import type { PickupLocation } from "../types";
import { AppPickupLocationDetail } from "./AppPickupLocationDetail";

const OP = "op-1";
const PICKUP = "p-1";

const PICKUP_LOCATION: PickupLocation = {
	id: PICKUP,
	context: "pickup-locations",
	name: "Old Port",
	time: "09:30:00",
	createdAt: "2026-03-01T10:00:00Z",
};

const qc = new QueryClient({
	defaultOptions: {
		queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
	},
});
qc.setQueryData(queryKeys.pickupLocation(OP, PICKUP), PICKUP_LOCATION);
qc.setQueryData(queryKeys.activityTimeline(OP, "PICKUP_LOCATION", PICKUP), {
	pages: [{ data: [], nextCursor: null }],
	pageParams: [null],
});

const meta = {
	title: "PickupLocations/AppPickupLocationDetail",
	component: AppPickupLocationDetail,
	args: { tourOperatorId: OP, pickupLocationId: PICKUP },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<div className="mx-auto w-full max-w-3xl">
						<Story />
					</div>
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppPickupLocationDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
