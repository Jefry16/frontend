import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ColumnDef, HeaderContext } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { seedTable, storyQueryClient } from "#/dev/story-utils";
import { AppDataTable } from "./AppDataTable";
import { AppDataTableHeader } from "./AppDataTableHeader";

interface Row {
	id: string;
	name: string;
}

const ENDPOINT = "/tour-operators/op-1/things";
const KEY = ["header-story", "op-1"] as const;

const client = storyQueryClient((qc) =>
	seedTable<Row>(qc, KEY, ENDPOINT, [{ id: "1", name: "Sunset kayak" }]),
);

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

export const Sortable: Story = {
	args: {
		header: (ctx) => <AppDataTableHeader label="Name" headerContext={ctx} />,
	},
};

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

export const PlainLabel: Story = {
	args: {
		sortable: false,
		header: (ctx) => <AppDataTableHeader label="Name" headerContext={ctx} />,
	},
};
