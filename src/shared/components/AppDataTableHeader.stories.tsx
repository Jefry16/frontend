import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ColumnDef, HeaderContext } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { AppDataTable } from "./AppDataTable";
import { AppDataTableHeader } from "./AppDataTableHeader";

interface Row {
	id: string;
	name: string;
}

const ENDPOINT = "/tour-operators/op-1/things";
const KEY = ["header-story", "op-1"] as const;

const client = storyQueryClient((qc) =>
	qc.setQueryData(
		[...KEY, ENDPOINT, [], [], undefined],
		listPage<Row>([{ id: "1", name: "Sunset kayak" }]),
	),
);

// The header only exists as a column's `header` renderer, so it needs a real
// HeaderContext. Storying it through a table gives it one, and shows it where
// it actually lives — sticky, in a <th> that carries the aria-sort.
function HeaderDemo({
	sortable = true,
	header,
}: {
	sortable?: boolean;
	header: (ctx: HeaderContext<Row, unknown>) => ReactNode;
}) {
	const columns: ColumnDef<Row, unknown>[] = [
		{
			id: "name",
			enableSorting: sortable,
			header,
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
	title: "Shared/AppDataTableHeader",
	component: HeaderDemo,
} satisfies Meta<typeof HeaderDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sorting only: clicking cycles asc → desc → none, and the <th> carries the
// matching aria-sort.
export const Sortable: Story = {
	args: {
		header: (ctx) => <AppDataTableHeader label="Name" headerContext={ctx} />,
	},
};

// A text filter — an operator plus a debounced search, sent as filter[field][op].
export const WithTextFilter: Story = {
	args: {
		header: (ctx) => (
			<AppDataTableHeader
				label="Name"
				headerContext={ctx}
				allowFiltering="text"
			/>
		),
	},
};

// A set filter over static options.
export const WithSetFilter: Story = {
	args: {
		header: (ctx) => (
			<AppDataTableHeader
				label="Status"
				headerContext={ctx}
				allowFiltering="set"
				items={[
					{ value: "PUBLISHED", label: "Published" },
					{ value: "DRAFT", label: "Draft" },
				]}
			/>
		),
	},
};

// A column that does not opt into sorting: a plain label, no button, no aria-sort.
export const PlainLabel: Story = {
	args: {
		sortable: false,
		header: (ctx) => <AppDataTableHeader label="Name" headerContext={ctx} />,
	},
};
