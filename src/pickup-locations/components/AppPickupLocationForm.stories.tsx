import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PickupLocation } from "../types";
import { AppPickupLocationForm } from "./AppPickupLocationForm";

const PICKUP: PickupLocation = {
	id: "p-1",
	context: "pickup-locations",
	name: "Old Port",
	time: "09:30:00",
	createdAt: "2026-03-01T10:00:00Z",
};

const qc = new QueryClient();

const meta = {
	title: "PickupLocations/AppPickupLocationForm",
	component: AppPickupLocationForm,
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
} satisfies Meta<typeof AppPickupLocationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};
export const Edit: Story = { args: { pickup: PICKUP } };
