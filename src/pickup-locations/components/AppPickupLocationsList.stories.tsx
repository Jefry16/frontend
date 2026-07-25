import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { queryKeys } from "#/lib/query-keys";
import type { PickupLocation } from "../types";
import { AppPickupLocationsList } from "./AppPickupLocationsList";

const OP_ID = "op-1";

const PICKUPS: PickupLocation[] = [
	{
		id: "p-1",
		context: "pickup-locations",
		name: "Old Port",
		time: "09:30:00",
		createdAt: "2026-03-01T10:00:00Z",
	},
	{
		id: "p-2",
		context: "pickup-locations",
		name: "Marina Gate B",
		time: "08:45:00",
		createdAt: "2026-04-11T09:00:00Z",
	},
	{
		id: "p-3",
		context: "pickup-locations",
		name: "Cathedral Square",
		time: "10:15:00",
		createdAt: "2026-05-20T14:00:00Z",
	},
];

const qc = new QueryClient({
	defaultOptions: {
		queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
	},
});
qc.setQueryData(
	[
		...queryKeys.pickupLocations(OP_ID),
		`/tour-operators/${OP_ID}/pickup-locations`,
		[],
		[],
		undefined,
	],
	{ pages: [{ data: PICKUPS, nextCursor: null }], pageParams: [null] },
);

const meta = {
	title: "PickupLocations/AppPickupLocationsList",
	component: AppPickupLocationsList,
	args: { tourOperatorId: OP_ID },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<Story />
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppPickupLocationsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
