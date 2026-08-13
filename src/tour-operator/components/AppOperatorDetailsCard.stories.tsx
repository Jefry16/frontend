import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { TourOperatorDetails } from "../types";
import { AppOperatorDetailsCard } from "./AppOperatorDetailsCard";

const OP = "op-1";

const details = (
	over: Partial<TourOperatorDetails> = {},
): TourOperatorDetails => ({
	id: OP,
	context: "tour-operators",
	name: "Acme Tours",
	handle: "acme-tours",
	address: {
		address1: "Calle Mayor 1",
		address2: null,
		city: "Madrid",
		province: "Madrid",
		zip: "28013",
		countryId: "11111111-1111-1111-1111-111111111111",
		countryCode: "ES",
		countryName: "Spain",
	},
	phone: "+1 809 555 0134",
	email: "hola@acmetours.do",
	timezoneId: "tz-1",
	currencyId: "cur-1",
	createdAt: "2026-01-04T09:00:00Z",
	updatedAt: "2026-08-01T09:00:00Z",
	...over,
});

const qc = (d: TourOperatorDetails) =>
	storyQueryClient((c) => {
		c.setQueryData(queryKeys.operatorDetails(OP), d);
		c.setQueryData(queryKeys.timezones, [
			{ id: "tz-1", name: "America/Santo_Domingo" },
			{ id: "tz-2", name: "Europe/Madrid" },
		]);
		c.setQueryData(queryKeys.currencies, [
			{ id: "cur-1", code: "DOP", name: "Dominican peso" },
			{ id: "cur-2", code: "USD", name: "US dollar" },
		]);
	});

const meta = {
	title: "TourOperator/AppOperatorDetailsCard",
	component: AppOperatorDetailsCard,
	args: { tourOperatorId: OP, canWrite: true },
} satisfies Meta<typeof AppOperatorDetailsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Editable: Story = {
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc(details())}>
				<Story />
			</QueryClientProvider>
		),
	],
};

// Phone and email are optional columns — a shop may have neither.
export const NoContactDetails: Story = {
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc(details({ phone: null, email: null }))}>
				<Story />
			</QueryClientProvider>
		),
	],
};

// STAFF may read the record but not change it.
export const ReadOnly: Story = {
	args: { canWrite: false },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc(details())}>
				<Story />
			</QueryClientProvider>
		),
	],
};
