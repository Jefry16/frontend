import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { seedTable, storyQueryClient } from "#/dev/story-utils";
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

const qc = storyQueryClient();
seedTable(
	qc,
	queryKeys.pickupLocations(OP_ID),
	`/tour-operators/${OP_ID}/pickup-locations`,
	PICKUPS,
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
