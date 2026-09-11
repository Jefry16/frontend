import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { seedAllPages, seedTable, storyQueryClient } from "#/dev/story-utils";
import { AppDataTable } from "./AppDataTable";
import { AppDataTableHeader } from "./AppDataTableHeader";

interface Row {
	id: string;
	name: string;
}

const ENDPOINT = "/tour-operators/op-1/things";
const KEY = ["async-filter-story", "op-1"] as const;
const OPTIONS_ENDPOINT = "/tour-operators/op-1/members";
const OPTIONS_KEY = ["async-filter-options", "op-1"] as const;

const client = storyQueryClient((qc) => {
	seedTable<Row>(qc, KEY, ENDPOINT, [
		{ id: "1", name: "Sunset kayak" },
		{ id: "2", name: "Reef snorkel" },
	]);
	seedAllPages(qc, OPTIONS_KEY, OPTIONS_ENDPOINT, [
		{ id: "u1", name: "Ada Lovelace" },
		{ id: "u2", name: "Grace Hopper" },
		{ id: "u3", name: "Katherine Johnson" },
	]);
});

function AsyncFilterDemo() {
	const columns: ColumnDef<Row, unknown>[] = [
		{
			id: "owner",
			enableSorting: true,
			header: (ctx) => (
				<AppDataTableHeader
					label="Owner"
					headerContext={ctx}
					allowFiltering="setAsync"
					endpoint={OPTIONS_ENDPOINT}
					queryKey={OPTIONS_KEY}
				/>
			),
			cell: ({ row }) => row.original.name,
		},
	];
	return (
		<QueryClientProvider client={client}>
			<AppDataTable<Row> columns={columns} endpoint={ENDPOINT} queryKey={KEY} />
		</QueryClientProvider>
	);
}

const meta = {
	title: "Shared/AppAsyncSetFilter",
	component: AsyncFilterDemo,
} satisfies Meta<typeof AsyncFilterDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
