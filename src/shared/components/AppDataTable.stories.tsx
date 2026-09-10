import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { AppDataTable } from "./AppDataTable";
import { AppDataTableHeader } from "./AppDataTableHeader";
import { timestampColumn } from "./table-columns";

interface Row {
	id: string;
	name: string;
	status: string;
	createdAt: string;
}

const ENDPOINT = "/tour-operators/op-1/things";
const KEY = ["things", "op-1"] as const;

const seeded = (rows: Row[]) =>
	storyQueryClient((qc) =>
		qc.setQueryData([...KEY, ENDPOINT, [], [], undefined], listPage(rows)),
	);

const columns: ColumnDef<Row, unknown>[] = [
	{
		id: "name",
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader
				label="Name"
				headerContext={ctx}
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
	},
	{
		id: "status",
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
		cell: ({ row }) => row.original.status,
	},
	timestampColumn<Row>("createdAt", "Created", () => "9 Aug 2026"),
];

const rows: Row[] = [
	{
		id: "1",
		name: "Sunset kayak",
		status: "Published",
		createdAt: "2026-08-09T10:00:00Z",
	},
	{
		id: "2",
		name: "Reef snorkel",
		status: "Draft",
		createdAt: "2026-08-08T09:00:00Z",
	},
	{
		id: "3",
		name: "Waterfall hike",
		status: "Published",
		createdAt: "2026-08-07T08:00:00Z",
	},
];

const meta = {
	title: "Shared/AppDataTable",
	component: AppDataTable,
	args: {
		columns,
		endpoint: ENDPOINT,
		queryKey: KEY,
		emptyState: {
			title: "No experiences yet",
			description: "Create one to see it here.",
		},
	},
	decorators: [
		(Story) => (
			<QueryClientProvider client={seeded(rows)}>
				<Story />
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppDataTable<Row>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
	decorators: [
		(Story) => (
			<QueryClientProvider client={seeded([])}>
				<Story />
			</QueryClientProvider>
		),
	],
};
