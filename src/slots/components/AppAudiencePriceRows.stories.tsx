import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import type { Audience } from "#/audiences";
import { type AudiencePriceRow, emptyPriceRow } from "../validators/slot";
import { AppAudiencePriceRows } from "./AppAudiencePriceRows";

const AUDIENCES: Audience[] = [
	{
		id: "a-1",
		context: "audiences",
		name: "Adult",
		paxPerUnit: 1,
		createdAt: "2026-03-01T10:00:00Z",
	},
	{
		id: "a-2",
		context: "audiences",
		name: "Child",
		paxPerUnit: 1,
		createdAt: "2026-03-01T10:00:00Z",
	},
	{
		id: "a-3",
		context: "audiences",
		name: "VIP Table for 6",
		paxPerUnit: 6,
		createdAt: "2026-03-01T10:00:00Z",
	},
];

function RowsDemo({ initial }: { initial?: AudiencePriceRow[] }) {
	const form = useForm({
		defaultValues: { audiencePrices: initial ?? [emptyPriceRow()] },
	});
	return (
		<div className="w-full max-w-2xl">
			<form.Field name="audiencePrices">
				{(field) => (
					<AppAudiencePriceRows field={field} audiences={AUDIENCES} />
				)}
			</form.Field>
		</div>
	);
}

const meta = {
	title: "Slots/AppAudiencePriceRows",
	component: RowsDemo,
} satisfies Meta<typeof RowsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
	args: {
		initial: [
			{ _key: "k1", audienceId: "a-1", price: "65", capacity: "20" },
			{ _key: "k2", audienceId: "a-2", price: "35", capacity: "10" },
		],
	},
};
