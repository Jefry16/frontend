import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { listPage, storyQueryClient } from "#/dev/story-utils";
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

// Two seeds: the table's own rows, and the option catalogue the filter drains.
// useAllPages keys the latter as [...queryKey, "all-pages"].
const client = storyQueryClient((qc) => {
	qc.setQueryData(
		[...KEY, ENDPOINT, [], [], undefined],
		listPage<Row>([
			{ id: "1", name: "Sunset kayak" },
			{ id: "2", name: "Reef snorkel" },
		]),
	);
	qc.setQueryData(
		[...OPTIONS_KEY, "all-pages"],
		listPage([
			{ id: "u1", name: "Ada Lovelace" },
			{ id: "u2", name: "Grace Hopper" },
			{ id: "u3", name: "Katherine Johnson" },
		]),
	);
});

// The async set filter is a filter *mode* of a column header, so it is storied
// where it lives. It loads every page of the endpoint, then hands the deduped
// options to AppSetFilter — safe because the catalogue is bounded (a roster).
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

// Open the funnel on the Owner column: the options came from the endpoint, not
// from the rows on screen.
export const Default: Story = {};
